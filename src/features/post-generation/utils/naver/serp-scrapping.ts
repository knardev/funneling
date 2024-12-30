import * as cheerio from "cheerio";
import { SmartBlock, SmartBlockItem, PopularTopicItem, SerpData } from "@/features/post-generation/types";
import { Cheerio } from "cheerio";
import type { Element } from "domhandler";


/**
 * Fetch and parse all data from the moreButtonLink.
 * @param moreButtonLink - The URL to fetch data from.
 * @returns A list of SmartBlockItem objects.
 */
async function fetchAllDetailSerpData(
  moreButtonLink: string,
): Promise<SmartBlockItem[]> {
  const start = 4;
  const items: SmartBlockItem[] = [];

  // Construct the URL with the updated start parameter
  const url = new URL(moreButtonLink);
  url.searchParams.set("start", start.toString());

  console.log(`[FETCH] Fetching data from URL: ${url}`);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(`[ERROR] Failed to fetch data: ${response.status}`);
    }

    const json = await response.json();
    const collection = json?.dom?.collection || json?.collection;

    if (!collection || !collection[0]?.html) {
      console.log("[INFO] No more data to fetch.");
    }

    // Parse the HTML to extract SmartBlockItems
    const html = collection[0].html;
    const $ = cheerio.load(html);

    $("div.fds-ugc-block-mod").each((index, itemElement) => {
        $(itemElement).find(".fds-info-sub-inner-text").text() || null;
        const postTitle =
        $(itemElement)
          .find(".fds-comps-right-image-text-title span")
          .text()
          .trim() || // 첫 번째 방식: span 안의 텍스트 추출
        $(itemElement)
          .find("span.fds-comps-right-image-text-title")
          .contents()
          .text()
          .trim() || // 두 번째 방식: span 자체의 텍스트 추출
        null;     
      const rank = index ++;

      items.push({
        postTitle,
        rank,
      });
    });

    console.log(`[INFO] Fetched ${items.length} items so far.`);
  } catch (error) {
    console.error(
      `[ERROR] Error while fetching or processing data: ${error}`,
    );
  }

  return items;
}


/**
 * Extract SmartBlocks and PopularTopics from the HTML.
 * @param html - The HTML content to parse.
 * @param url - The URL of the page.
 * @returns An object containing SmartBlocks and PopularTopics.
 */
function extractSmartBlocks(
  html: string,
  url: string,
): {
  smartBlocks: SmartBlock[];
  popularTopics: PopularTopicItem[];
  basicBlock: SmartBlockItem[];
} {
  const $ = cheerio.load(html);
  const smartBlocks: SmartBlock[] = [];
  const popularTopics: PopularTopicItem[] = [];
  const basicBlockItems: SmartBlockItem[] = [];
  let blockIndex = 0;

  const excludeValues = new Set([
    "VIEW",
    "뉴스",
    "FAQ",
    "지식iN",
    "지식백과",
    "플레이스",
    "이미지",
    "동영상",
    "파워링크",
    "연관 검색어",
    "비즈사이트",
    "네이버 도서",
    "방금 본 도서와 비슷한 도서",
    "카페 중고거래",
    "네이버쇼핑",
    "방금 본 상품 연관 추천",
    "국어사전",
    "함께 많이 찾는",
    "많이 본 지식백과",
    "오디오클립",
  ]);

  // ✅ main_pack 내에서 api_subject_bx만 선택
  $("div.main_pack").find("div.api_subject_bx").each((_, blockElement) => {
    const $block = $(blockElement);

    const headlineType = $block
      .find("span.fds-comps-header-headline")
      .text()
      .trim() || null;

    const modTitleType = $block
      .find(".mod_title_area .title_wrap h2.title")
      .text()
      .trim() || null;

    const apiTitleType = $block
      .find("h3.api_title")
      .text()
      .trim() || null;

    const feedHeaderType = $block
      .find("h2.fds-feed-header-title")
      .text()
      .trim() || null;

    const lstTotalType = $block
      .find("ul.lst_total")
      .length > 0
      ? "웹사이트"
      : null;

    let type = headlineType || modTitleType || apiTitleType || feedHeaderType || lstTotalType;

    blockIndex++; // Increment block index


    const items: SmartBlockItem[] = [];

    $(blockElement)
      .find("li.bx") // `bx` 클래스를 가진 모든 li 요소 선택
      .each((index, itemElement) => {
        const $item = $(itemElement);
    
        // 광고 여부 확인 (type_ad 클래스가 있는지 확인)
        if ($item.hasClass('type_ad')) {
          return; // 광고 게시글은 스킵
        }
    
        // 제목 스크래핑
        const postTitle =
          $item
            .find(".fds-comps-right-image-text-title span")
            .text()
            .trim() || // 첫 번째 방식: span 안의 텍스트 추출
          $item
            .find("span.fds-comps-right-image-text-title")
            .contents()
            .text()
            .trim() || // 두 번째 방식: span 자체의 텍스트 추출
          $item
            .find("div.title_area > a")
            .text()
            .trim() || 
            null; // 세 번째 방식: title_area 안의 a 태그 추출
    
        // postTitle이 null이거나 빈 문자열인 경우 스킵
        if (!postTitle) {
          console.log("⚠️ 빈 제목 또는 null 제목 발견, 건너뜁니다.");
          return;
        }
    
        const rank = items.length + 1; // ✅ 유효한 항목만 카운트하여 rank 부여
    

        items.push({
          postTitle,
          rank,
        });
        console.log(`SmartBlockItem 추가: ${postTitle} (순위: ${rank})`);
      });

    // Extract `moreButtonLink` for the Smart Block
    const moreButtonRawLink = $(blockElement)
      .find(".fds-comps-footer-more-button-container")
      .attr("data-lb-trigger") || null;
    const moreButtonLink = moreButtonRawLink
      ? `${url}#lb_api=${moreButtonRawLink}`
      : null;

    // Add the Smart Block to the list with current blockIndex as index
    smartBlocks.push({ 
      type, 
      items, 
      moreButtonLink, 
      moreButtonRawLink, 
      index: blockIndex 
    });

    console.log(`SmartBlock 추가: ${type} (index: ${blockIndex})`);
  });

  // Process blocks with "인기글" in the title and add items to existing smart blocks
  $("div.api_subject_bx").each((_, blockElement) => {
    const title = $(blockElement)
      .find(".mod_title_area > .title_wrap > .title")
      .text()
      .trim();

    if (!title.includes("인기글")) return;

    // Find matching smart block by type
    const existingBlock = smartBlocks.find(block => block.type === title);
    if (!existingBlock) return;

    // Add items to the existing block
    $(blockElement)
      .find(".view_wrap")
      .each((index, itemElement) => {
        const postTitle = $(itemElement)
          .find(".title_area > a")
          .text()
          .trim() || null;
        const rank = existingBlock.items.length + index + 1;

        existingBlock.items.push({
          postTitle,
          rank,
        });
      });

    console.log(`Added items to SmartBlock: ${title}`);
    console.log(`Updated items: ${existingBlock.items.map(item => item.postTitle)}`);
  });


  return { smartBlocks, popularTopics, basicBlock: basicBlockItems };
}


export async function fetchSerpResults(
  keyword: string,
): Promise<SerpData | null> {
  console.log(`[ACTION] Fetching SERP results for keyword: ${keyword}`);

  const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
      },
    });

    if (!response.ok) {
      console.error(`[ERROR] Failed to fetch SERP results: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const { smartBlocks, popularTopics, basicBlock } = extractSmartBlocks(
      html,
      url,
    );

    // Fetch additional data for each SmartBlock's moreButtonLink
    for (const block of smartBlocks) {
      if (block.moreButtonLink) {
        console.log(
          `[INFO] Fetching additional data for block: ${block.type}`,
        );
        if (block.type?.includes("인플루언서")) {
          continue;
        }
        const additionalItems = await fetchAllDetailSerpData(
          block.moreButtonRawLink ?? "",
        );
        block.items.push(...additionalItems); // Append additional items to the block
      }
    }

    return {
      smartBlocks,
      popularTopics,
      basicBlock, // 기본 블록은 빈 배열로 유지
    };
  } catch (error) {
    console.error(
      `[ERROR] Failed to process SERP results: ${(error as Error).message}`,
    );
    return null;
  }
}




