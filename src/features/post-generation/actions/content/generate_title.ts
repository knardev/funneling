 "use server";

import { TitleResponse, Analysis, Persona } from "../../types";
import { fetchBlogTitles } from "../../utils/naver";
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";
import { makeOpenAiRequest } from "../../utils/ai/openai";
import { titlePrompt_test } from "../../prompts/contentPrompt/titlePrompt_test";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateTitle(
  keyword: string,
  subkeywordlist: string[] | null,
  analysis?: Analysis
): Promise<TitleResponse> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1초
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`API 요청 시도 ${retryCount + 1}/${MAX_RETRIES}`);
      
      const mainkeyword = keyword;
      const subkeyword = subkeywordlist || [];

      const html1 = await fetchBlogTitles(mainkeyword);
      const extractedText = await extractTextAfterTitleArea(html1);
      const extratedTitles: string[] = limitTextArray(extractedText);

      const topKeywords = extractTopKeywords(extratedTitles);
      const highImportanceTitles = extratedTitles.slice(0, 3);
      const lowImportanceTitles = extratedTitles.slice(3);

      const totalSubkeywords = topKeywords.concat(subkeyword);

      const response = await makeOpenAiRequest<{
        analysis_results: {
          keyword_structure: {
            spacing_pattern: string;
            position_pattern: string;
            average_length: {
              syllables: string;
              characters: string;
            };
          };
          common_patterns: string[];
          keyword_combinations: string[];
        };
        selected_subkeywords: string[];
        optimized_titles: {
          strict_structure: string[];
          creative_structure: string[];
        };
      }>(
        titlePrompt_test.generatePrompt(
          mainkeyword,
          highImportanceTitles,
          lowImportanceTitles,
          totalSubkeywords,
          analysis
        ),
        titlePrompt_test.system
      );

      const optimizedTitles = response.optimized_titles.strict_structure
        .concat(response.optimized_titles.creative_structure);

      if (!response.optimized_titles || !response.selected_subkeywords) {
        throw new Error("OpenAI 응답이 예상 형식과 다릅니다");
      }

      return {
        selected_subkeywords: response.selected_subkeywords || [],
        optimizedTitles: optimizedTitles,
        extractedTitles: extratedTitles
      };

    } catch (error) {
      retryCount++;
      console.error(`에러 발생 (시도 ${retryCount}/${MAX_RETRIES}):`, error);
      
      if (retryCount === MAX_RETRIES) {
        console.error('최대 재시도 횟수 도달');
        return {
          selected_subkeywords: [],
          optimizedTitles: [],
          extractedTitles: []
        };
      }

      // 다음 시도 전 대기
      await wait(RETRY_DELAY);
    }
  }

  // 이 부분은 TypeScript를 만족시키기 위한 기본 반환값
  return {
    selected_subkeywords: [],
    optimizedTitles: [],
    extractedTitles: []
  };
}

function extractTextAfterTitleArea(html: string): string[] {
  const regex: RegExp = /<div class="title_area">[\s\S]*?<a[^>]*>(.*?)<\/a>/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  let index = 0; // 추출 순서를 추적하는 변수

  while ((match = regex.exec(html)) !== null) {
    let extractedText: string = match[1];

    // <mark> 태그를 { }로 변환
    extractedText = extractedText
      .replace(/<mark>/g, '{')
      .replace(/<\/mark>/g, '}');

    matches.push(extractedText.trim());

    // 로그를 추가해 순서와 내용 확인
    index++;
  }

  return matches;
}


function limitTextArray(texts: string[], limit: number = 8): string[] {
  return texts.slice(0, limit);
}

function extractTopKeywords(titles: string[]): string[] {
  if (!titles || !titles.length) {
    return [];
  }

  // 불용어 목록
  const stopWords = new Set([
    // 일반적인 조사/접속사
    '및', '의', '후', '이', '그', '저', '것', '수', 
    '을', '를', '이', '가', '과', '와', '는', '에', '께',
    // 일반적인 동사/형용사
    '있다', '없다', '하다', '되다', '이다',
    // 특수문자와 숫자
    ...'1234567890!@#$%^&*()'.split(''),
    // 일반적인 접두어/접미어
    '재', '적', '성', '화', '들'
  ]);

  const cleanText = (text: string): string => {
    return text
      // HTML 태그 제거
      .replace(/<[^>]*>/g, '')
      // 이모지 및 특수 문자 제거 (수정된 부분)
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|[\uE000-\uF8FF]/g, '')
      // 중괄호로 둘러싸인 내용 제거
      .replace(/\{.*?\}/g, '')
      // 대괄호로 둘러싸인 내용 제거
      .replace(/\[.*?\]/g, '')
      // URL 제거
      .replace(/https?:\/\/\S+/g, '')
      // 특수문자를 공백으로 변경
      .replace(/[^\w\s가-힣]/g, ' ')
      // 연속된 공백을 하나로 축소
      .replace(/\s+/g, ' ')
      .trim();
  };

  const wordCounts: Record<string, number> = {};
  const processedTitles = titles.map(cleanText);

  processedTitles.forEach(title => {
    // 한글, 영문자로 구성된 단어 추출
    const words = title.match(/[\w가-힣]+/g) || [];
    
    words.forEach(word => {
      // 단어 정제 조건
      if (
        word &&
        word.length >= 2 && // 2글자 이상
        !stopWords.has(word) && // 불용어 제외
        !/^\d+$/.test(word) && // 숫자로만 이루어진 문자열 제외
        !(/^[a-zA-Z]{1,2}$/.test(word)) // 1-2글자 영문자 제외
      ) {
        // 대소문자 구분 없이 처리
        const normalizedWord = word.toLowerCase();
        wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
      }
    });
  });

  // 빈도수 기준으로 상위 5개 키워드 추출
  return Object.entries(wordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([word]) => word);
}

