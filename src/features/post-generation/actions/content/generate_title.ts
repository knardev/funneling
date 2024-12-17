 "use server";

import { TitleResponse, Analysis, Persona } from "../../types";
import { fetchBlogTitles } from "../../utils/naver";
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";
import { makeOpenAiRequest } from "../../utils/ai/openai";
import { titlePrompt_test } from "../../prompts/contentPrompt/titlePrompt_test";

export async function generateTitle(
  keyword: string,
  subkeywordlist: string[] | null,
  analysis?: Analysis
): Promise<TitleResponse> {
  console.log("keyword:", keyword);
  console.log("subkeywordlist:", subkeywordlist);

  const mainkeyword = keyword;
  console.log("mainkeyword:", mainkeyword);
  const subkeyword = subkeywordlist || [];
  console.log("subkeyword:", subkeyword);

  const html1 = await fetchBlogTitles(mainkeyword);
  const extractedText = await extractTextAfterTitleArea(html1);

  const extratedTitles: string[] = limitTextArray(extractedText);
  console.log("extractedTitles:", extratedTitles);

  const topKeywords = extractTopKeywords(extratedTitles);
  console.log("topKeywords:", topKeywords);

  const highImportanceTitles = extratedTitles.slice(0, 3);
  const lowImportanceTitles = extratedTitles.slice(3);

  console.log("subkeyword:", subkeyword);
  const totalSubkeywords = topKeywords.concat(subkeyword);
  console.log("totalSubkeywords:", totalSubkeywords);

  console.log("analysis:", analysis);
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
    titlePrompt_test.system, // 수정된 부분
  );
 
  console.log("OpenAI 응답:", response);

  const optimizedTitles = response.optimized_titles.strict_structure
  .concat(response.optimized_titles.creative_structure);
  // 응답 검증
  if (!response.optimized_titles || !response.selected_subkeywords) {
    console.error("OpenAI 응답이 예상 형식과 다릅니다:", response);
    return {
      selected_subkeywords: [],
      optimizedTitles: []
    };
  }

  const selectedSubkeywords = response.selected_subkeywords;
  console.log("selected_subkeywords:", selectedSubkeywords);

  // 응답 데이터
  console.log("generateTitle 응답 데이터:", JSON.stringify({
    selected_subkeywords: selectedSubkeywords,
    optimized_titles: optimizedTitles
  }));

  return {
    selected_subkeywords: selectedSubkeywords || [],
    optimizedTitles: optimizedTitles
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

