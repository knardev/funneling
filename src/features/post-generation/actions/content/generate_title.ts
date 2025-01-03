"use server";

import { TitleResponse,ImportanceTitles, Analysis, ScrapingResults } from "../../types";
import { makeOpenAiRequest, } from "../../utils/ai/openai";
import{ makeClaudeRequest } from "../../utils/ai/claude"; 
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";
import { title } from "process";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



/**
 * 개별 블록을 OpenAI에 전달하여 제목을 생성
 */
async function processBlock(
  block: { type: string; scrapedtitle: { rank: number; postTitle: string }[] },
  mainKeyword: string,
  subkeywords: string[],
  analysis?: Analysis
) {
  const { type, scrapedtitle } = block;

  console.log(`"${type}" 블록 처리 중...`);

  const scrapedtitles = scrapedtitle.map(item => item.postTitle);
  console.log("scrapedtitles:", scrapedtitles);

  const response = await makeOpenAiRequest<{
    analysis_results: {
      tab_patterns: {
        repeated_keywords: string[];
        keyword_positions: string;
        phrase_patterns: string[];
        title_structure: string;
      };
      keyword_structure: {
        spacing_pattern: string;
        position_pattern: string;
        average_length: {
          syllables: string;
          characters: string;
        };
      };
      common_patterns: string[];
    };
    selected_subkeywords: string[];
    optimized_titles: {
      strict_structure: string;
      creative_structure: string;
      style_patterns: string;
    };
  }>(
    titlePrompt.generatePrompt(mainKeyword, scrapedtitles, subkeywords, analysis),
    titlePrompt.system,
  );
  console.log("titlePrompt.generatePrompt:", titlePrompt.generatePrompt(mainKeyword, scrapedtitles, subkeywords, analysis));
  console.log("selected_subkeywords:", response.selected_subkeywords);
  return {
    blockType: type,
    strictTitle: response.optimized_titles.strict_structure,
    creativeTitle: response.optimized_titles.creative_structure,
    styleTitle: response.optimized_titles.style_patterns,
    block_subkeywords: response.selected_subkeywords
  };
}

/**
 * 메인 함수: 블록 단위로 제목 생성 및 통합
 */
export async function generateTitle(
  keyword: string,
  subkeywordlist: string[] | null,
  scrapingResults: ScrapingResults,
  analysis?: Analysis
): Promise<TitleResponse> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1초

  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`API 요청 시도 ${retryCount + 1}/${MAX_RETRIES}`);

      const mainkeyword = keyword;
      const subkeywords = subkeywordlist || [];
      const selected_subkeywords: string[] = [];

      const extractedTitles: string[] = [];
      const strictTitles: string[] = [];
      const creativeTitles: string[] = [];
      const styleTitles: string[] = [];



      if (scrapingResults.length === 1) {
        // ✅ scrapingResults에 블록이 하나일 경우
        console.log("단일 블록 감지됨: 3번 반복 처리");

        for (let i = 0; i < 3; i++) {
          const block = scrapingResults[0]; // 첫 번째 블록을 3번 반복 처리
          console.log(`반복 ${i + 1}:`, block);

          const blockResult = await processBlock(block, mainkeyword, subkeywords, analysis);

          extractedTitles.push(...block.scrapedtitle.map(item => item.postTitle));
          strictTitles.push(blockResult.strictTitle);
          creativeTitles.push(blockResult.creativeTitle);
          styleTitles.push(blockResult.styleTitle);
          selected_subkeywords.push(...blockResult.block_subkeywords);
        }
      } else {
        // ✅ scrapingResults에 블록이 여러 개일 경우
        console.log("다중 블록 감지됨: 일반 처리");

        for (const block of scrapingResults) {
          const blockResult = await processBlock(block, mainkeyword, subkeywords, analysis);

          extractedTitles.push(...block.scrapedtitle.map(item => item.postTitle));
          strictTitles.push(blockResult.strictTitle);
          creativeTitles.push(blockResult.creativeTitle);
          styleTitles.push(blockResult.styleTitle);
          selected_subkeywords.push(...blockResult.block_subkeywords);
        }
      }

      console.log("subkeywords:", selected_subkeywords);

      return {
        selected_subkeywords: Array.from(new Set(selected_subkeywords)), // 중복 제거
        optimizedTitles: {
          strict_structure: strictTitles,
          creative_structure: creativeTitles,
          style_patterns: styleTitles,
        },
        extractedTitles,
      };
    } catch (error) {
      retryCount++;
      console.error(`에러 발생 (시도 ${retryCount}/${MAX_RETRIES}):`, error);

      if (retryCount === MAX_RETRIES) {
        console.error("최대 재시도 횟수 도달");
        return {
          selected_subkeywords: [],
          optimizedTitles: {
            strict_structure: [],
            creative_structure: [],
            style_patterns: [],
          },
          extractedTitles: [],
        };
      }

      await wait(RETRY_DELAY);
    }
  }

  return {
    selected_subkeywords: [],
    optimizedTitles: {
      strict_structure: [],
      creative_structure: [],
      style_patterns: [],
    },
    extractedTitles: [],
  };
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
