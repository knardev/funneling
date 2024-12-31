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
  smartBlockItems: SmartBlockItem[],
): Promise<SmartBlockItem[]> {
  const start = smartBlockItems.length >0
  ? smartBlockItems[smartBlockItems.length - 1].rank + 1
  : 1;
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

    //블로그 제목 스크래핑 유형 1

    $("li.bx").each((index, itemElement) => {
      const $item = $(itemElement);

      // Check for advertisement indicators by class names
      const classes = $item.attr('class') || '';
      const hasAd = classes.includes('type_ad') || 
            classes.includes('_fe_view_power_content') ||
            $item.find("span.fds-ugc-gray70-ad-badge-text").length > 0 || 
            $item.find("i.spview.ico_ad").length > 0;
      
      // Skip if it's an advertisement
      if (hasAd) {
      return;
      }


      const postTitle =
      $item.find(".title_area > a")
        .text()
        .trim() || // 첫 번째 방식: span 안의 텍스트 추출
      $item.find("span.fds-comps-right-image-text-title")
        .contents()
        .text()
        .trim() || // 두 번째 방식: span 자체의 텍스트 추출
      null;     
    
      // Only add items with valid titles
      if (postTitle) {
      const rank = items.length + 1; // Use current items length for correct ranking
      items.push({
        postTitle,
        rank,
      });
      }
    });

    //블로그 제목 스크래핑 유형 2
    $("div.fds-ugc-block-mod").each((index, itemElement) => {
      const $item = $(itemElement);
      
      // Check for advertisement indicators
      const hasAd = $item.find("span.fds-ugc-gray70-ad-badge-text").length > 0 || 
             $item.find("i.spview.ico_ad").length > 0;
      
      // Skip if it's an advertisement
      if (hasAd) {
      return;
      }

      const infoText = $item.find(".fds-info-sub-inner-text").text() || null;
      const postTitle =
      $item.find(".fds-comps-right-image-text-title span")
        .text()
        .trim() || // 첫 번째 방식: span 안의 텍스트 추출
      $item.find("span.fds-comps-right-image-text-title")
        .contents()
        .text()
        .trim() || // 두 번째 방식: span 자체의 텍스트 추출
      null;     

      // Only add items with valid titles
      if (postTitle) {
      const rank = items.length + 1; // Use current items length for correct ranking
      items.push({
        postTitle,
        rank,
      });
      }
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
} {
  const $ = cheerio.load(html);
  const smartBlocks: SmartBlock[] = [];

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

    const type = headlineType || modTitleType || apiTitleType || feedHeaderType || lstTotalType;

    blockIndex++; // Increment block index


    const items: SmartBlockItem[] = [];

    $(blockElement)
      .find("li.bx") // `bx` 클래스를 가진 모든 li 요소 선택
      .each((index, itemElement) => {
        const $item = $(itemElement);
    
          // Check for advertisement indicators
          const hasAd = $item.find("span.fds-ugc-gray70-ad-badge-text").length > 0 || 
          $item.find("i.spview.ico_ad").length > 0 ||
          $item.find("type_ad").length > 0;

        // Skip if it's an advertisement
        if (hasAd) {
        return;
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
    const moreButtonRawLink = 
    $(blockElement)
      .find(".fds-comps-footer-more-button-container")
      .attr("data-lb-trigger") ||

     $(blockElement)
      .find(".mod_more_wrap > a")
      .attr("data-lb-trigger") || 
       null;
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

  return { smartBlocks };
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
    const { smartBlocks } = extractSmartBlocks(
      html,
      url,
    );

    // Fetch additional data for each SmartBlock's moreButtonLink
    for (const block of smartBlocks) {
      if (block.moreButtonLink) {
        console.log(
          `[INFO] Fetching additional data for block: ${block.type}`,
        );
        const additionalItems = await fetchAllDetailSerpData(
          block.moreButtonRawLink ?? "",
          block.items
        );
        block.items.push(...additionalItems); // Append additional items to the block
      }
    }

    return {
      smartBlocks,
    };
  } catch (error) {
    console.error(
      `[ERROR] Failed to process SERP results: ${(error as Error).message}`,
    );
    return null;
  }
}




