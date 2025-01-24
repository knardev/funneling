"use server";

import { TitleResponse, Analysis, ScrapingResults } from "../../types";
import { makeOpenAiRequest } from "../../utils/ai/openai";
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 단일 블록을 OpenAI에 전달하여 제목을 생성
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
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }>(
    titlePrompt.generatePrompt(mainKeyword, scrapedtitles, subkeywords, analysis),
    titlePrompt.system,
  );

  return {
    blockType: type,
    strictTitle: response.optimized_titles.strict_structure,
    creativeTitle: response.optimized_titles.creative_structure,
    styleTitle: response.optimized_titles.style_patterns,
    block_subkeywords: response.selected_subkeywords,
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
        // ✅ scrapingResults에 블록이 하나면, 같은 블록을 3번 병렬 요청
        console.log("단일 블록 감지됨: 3번 병렬 처리");

        const singleBlock = scrapingResults[0];

        // 3번 병렬 호출
        const promises = Array.from({ length: 3 }, () => 
          processBlock(singleBlock, mainkeyword, subkeywords, analysis)
        );
        const results = await Promise.all(promises);

        // 결과 합치기
        for (const blockResult of results) {
          extractedTitles.push(
            ...singleBlock.scrapedtitle.map(item => item.postTitle),
          );
          strictTitles.push(blockResult.strictTitle);
          creativeTitles.push(blockResult.creativeTitle);
          styleTitles.push(blockResult.styleTitle);
          selected_subkeywords.push(...blockResult.block_subkeywords);
        }

      } else {
        // ✅ scrapingResults에 블록이 여러 개라면, 각 블록을 병렬 처리
        console.log("다중 블록 감지됨: 블록별 병렬 처리");

        const promises = scrapingResults.map(block => 
          processBlock(block, mainkeyword, subkeywords, analysis)
        );
        const results = await Promise.all(promises);

        // 결과 합치기
        results.forEach((blockResult, idx) => {
          const block = scrapingResults[idx];
          extractedTitles.push(...block.scrapedtitle.map(item => item.postTitle));
          strictTitles.push(blockResult.strictTitle);
          creativeTitles.push(blockResult.creativeTitle);
          styleTitles.push(blockResult.styleTitle);
          selected_subkeywords.push(...blockResult.block_subkeywords);
        });
      }

      console.log("subkeywords:", selected_subkeywords);

      // 최종 반환
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

  // 재시도 후에도 실패 시 기본 구조 반환
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

/**
 * 추가: 필요한 경우 최빈 키워드 추출 로직 (기존 그대로)
 */
function extractTopKeywords(titles: string[]): string[] {
  if (!titles || !titles.length) return [];

  const stopWords = new Set([
    "및","의","후","이","그","저","것","수",
    "을","를","이","가","과","와","는","에","께",
    "있다","없다","하다","되다","이다",
    ...'1234567890!@#$%^&*()'.split(''),
    "재","적","성","화","들"
  ]);

  const cleanText = (text: string) => {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|[\uE000-\uF8FF]/g, "")
      .replace(/\{.*?\}/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^\w\s가-힣]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const wordCounts: Record<string, number> = {};
  const processedTitles = titles.map(cleanText);

  processedTitles.forEach(title => {
    const words = title.match(/[\w가-힣]+/g) || [];
    words.forEach(word => {
      if (
        word.length >= 2 &&
        !stopWords.has(word) &&
        !/^\d+$/.test(word) &&
        !/^[a-zA-Z]{1,2}$/.test(word)
      ) {
        const normalizedWord = word.toLowerCase();
        wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([word]) => word);
}
