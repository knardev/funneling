"use server";

import { TitleResponse, Analysis, ScrapingResults } from "../../types";
import { makeOpenAiRequest } from "../../utils/ai/openai";
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type ImportanceTitles = {
  high: string[];
  middle: string[];
  low: string[];
};

/**
 * 개별 블록을 처리하여 중요도에 따라 제목을 분류
 */
function categorizeTitles(scrapedtitle: { rank: number; postTitle: string }[]): ImportanceTitles {
  const importanceTitles: ImportanceTitles = { high: [], middle: [], low: [] };

  for (const item of scrapedtitle) {
    const title = item.postTitle;

    if (item.rank <= 3) {
      importanceTitles.high.push(title);
    } else if (item.rank <= 6) {
      importanceTitles.middle.push(title);
    } else {
      importanceTitles.low.push(title);
    }
  }

  return importanceTitles;
}

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

  const { high, middle, low } = categorizeTitles(scrapedtitle);

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
    titlePrompt.generatePrompt(mainKeyword, high, middle, low, subkeywords, analysis),
    titlePrompt.system
  );

  return {
    blockType: type,
    strictTitle: response.optimized_titles.strict_structure,
    creativeTitle: response.optimized_titles.creative_structure,
    styleTitle: response.optimized_titles.style_patterns
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

      const extractedTitles: string[] = [];
      const strictTitles: string[] = [];
      const creativeTitles: string[] = [];
      const styleTitles: string[] = [];

      // 블록별 처리
      for (const block of scrapingResults) {
        const blockResult = await processBlock(block, mainkeyword, subkeywords, analysis);

        extractedTitles.push(...block.scrapedtitle.map(item => item.postTitle));
        strictTitles.push(blockResult.strictTitle);
        creativeTitles.push(blockResult.creativeTitle);
        styleTitles.push(blockResult.styleTitle);
      }

      return {
        selected_subkeywords: Array.from(new Set(subkeywords)), // 중복 제거
        optimizedTitles: {
          strict_structure: strictTitles,
          creative_structure: creativeTitles,
          style_patterns: styleTitles
        },
        extractedTitles
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
            style_patterns: []
          },
          extractedTitles: []
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
      style_patterns: []
    },
    extractedTitles: []
  };
}
