import * as cheerio from "cheerio";
import { SmartBlock, SmartBlockItem, PopularTopicItem, SerpData } from "@/features/post-generation/types";
import { Cheerio } from "cheerio";
import type { Element } from "domhandler";

function extractPostTitle($item: Cheerio<Element>): string | null {
  if (
    $item.find("span.fds-ugc-gray70-ad-badge-text").length > 0 ||
    $item.find("i.spview.ico_ad").length > 0 ||
    $item.attr("class")?.includes("type_ad")
  ) {
    return null;
  }

  return (
    $item.find(".fds-comps-right-image-text-title span").text().trim() ||
    $item.find("span.fds-comps-right-image-text-title").contents().text().trim() ||
    $item.find(".title_area > a").text().trim() ||
    null
  );
}

/**
 * Fetch and parse all data from the moreButtonLink.
 * @param moreButtonLink - The URL to fetch data from.
 * @returns A list of SmartBlockItem objects.
 */
async function fetchAllDetailSerpData(
  moreButtonLink: string,
  smartBlockItems: SmartBlockItem[],
): Promise<SmartBlockItem[]> {
  const start = smartBlockItems.length > 0
    ? smartBlockItems[smartBlockItems.length - 1].rank + 1
    : 1;
  const items: SmartBlockItem[] = [];
  const url = new URL(moreButtonLink);
  url.searchParams.set("start", start.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const json = await response.json();
    const html = json?.dom?.collection?.[0]?.html || null;
    if (!html) throw new Error("No valid HTML found in response.");

    const $ = cheerio.load(html);

    /** ✅ 1. li.bx 요소에서 제목 스크래핑 **/
    $("li.bx").each((_, itemElement) => {
      const $item = $(itemElement);
      const postTitle = extractPostTitle($item);

      if (postTitle) {
        items.push({ postTitle, rank: items.length + 1 });
      }
    });

    /** ✅ 2. ugc-block-mod 요소에서 제목 스크래핑 **/
    $(".fds-ugc-block-mod ").each((_, itemElement) => {
      const $item = $(itemElement);

      // 광고 필터링
      if (
        $item.find("span.fds-ugc-gray70-ad-badge-text").length > 0 ||
        $item.find("i.spview.ico_ad").length > 0 ||
        $item.attr("class")?.includes("type_ad")
      ) {
        return;
      }

      // 제목과 URL 추출
      const postTitle =
        $item.find(".fds-comps-right-image-text-title span").text().trim() ||
        $item.find("span.fds-comps-right-image-text-title").contents().text().trim() ||
        $item.find(".title_area > a").text().trim() ||
        null;

      const postUrl = 
        $item.find(".fds-comps-right-image-text-title").attr("href") ||
        $item.find(".title_area > a").attr("href") ||
        null;

      // 네이버 블로그 URL 검증
      if (postTitle ) {
        items.push({ postTitle, rank: items.length + 1 });
      }
    });

    console.log(`[INFO] Fetched ${items.length} items.`);
  } catch (error) {
    console.error(`[ERROR] Fetch failed: ${(error as Error).message}`);
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
): { smartBlocks: SmartBlock[] } {
  const $ = cheerio.load(html);
  const smartBlocks: SmartBlock[] = [];
  let blockIndex = 0;

  // ✅ 이미 처리된 api_subject_bx의 참조를 저장
  const processedApiSubjects = new Set<string>();

  const excludeValues = new Set([
    "VIEW", "뉴스", "FAQ", "지식iN", "지식백과", "플레이스", "이미지", "동영상",
    "파워링크", "연관 검색어", "비즈사이트", "네이버 도서", "방금 본 도서와 비슷한 도서",
    "카페 중고거래", "네이버쇼핑", "방금 본 상품 연관 추천", "국어사전", "함께 많이 찾는",
    "많이 본 지식백과", "오디오클립",
  ]);

  // ✅ 1. spw_rerank 처리
  $("div.spw_rerank").each((_, spwElement) => {
    const $spwBlock = $(spwElement);
    const isHead = $spwBlock.hasClass("type_head") && $spwBlock.hasClass("_rra_head");
    const isBody = $spwBlock.hasClass("_rra_body");

    if (isHead || isBody) {
      blockIndex++;
      const type = "웹사이트"; // ✅ 블록 타입 설정
      const items: SmartBlockItem[] = [];

      // ✅ spw_rerank 내에서 postTitle 추출
      $spwBlock.find("li.bx").each((index, itemElement) => {
        const $item = $(itemElement);
        const postTitle =
          $item.find(".fds-comps-right-image-text-title span").text().trim() ||
          $item.find("span.fds-comps-right-image-text-title").contents().text().trim() ||
          $item.find(".title_area > a").text().trim() ||
          null;

        if (postTitle) {
          items.push({ postTitle, rank: items.length + 1 });

          // ✅ 해당 api_subject_bx의 고유 selector를 기록
          $item.parents("div.api_subject_bx").each((_, apiElement) => {
            const apiId = $(apiElement).attr('id') || $.html(apiElement); // id가 없으면 html 문자열로 구분
            processedApiSubjects.add(apiId);
          });
        }
      });

      smartBlocks.push({
        type,
        items,
        moreButtonLink: null,
        moreButtonRawLink: null,
        index: blockIndex,
      });

      console.log(`SmartBlock (웹사이트) 추가: index ${blockIndex}`);
    }
  });

  // ✅ 2. api_subject_bx 처리
  $("div.api_subject_bx").each((_, blockElement) => {
    const $block = $(blockElement);

    // ✅ 이미 spw_rerank에서 처리된 api_subject_bx인지 확인
    const apiId = $block.attr('id') || $.html($block); 
    if (processedApiSubjects.has(apiId)) {
      console.log(`[INFO] 이미 spw_rerank에서 처리된 api_subject_bx는 건너뜁니다.`);
      return;
    }

    const type = $block
      .find("span.fds-comps-header-headline").text().trim() ||
      $block.find(".mod_title_area .title_wrap h2.title").text().trim() ||
      $block.find("h3.api_title").text().trim() ||
      $block.find("h2.fds-feed-header-title").text().trim() ||
      ($block.find("ul.lst_total").length > 0 ? "웹사이트" : null);

    blockIndex++;
    const items: SmartBlockItem[] = [];

    $block.find("li.bx").each((index, itemElement) => {
      const $item = $(itemElement);
      const postTitle =
        $item.find(".fds-comps-right-image-text-title span").text().trim() ||
        $item.find("span.fds-comps-right-image-text-title").contents().text().trim() ||
        $item.find(".title_area > a").text().trim() ||
        null;

      if (postTitle) {
        items.push({ postTitle, rank: items.length + 1 });
      }
    });

    const moreButtonRawLink =
      $block.find(".fds-comps-footer-more-button-container").attr("data-lb-trigger") ||
      $block.find(".mod_more_wrap > a").attr("data-lb-trigger") ||
      null;

    const moreButtonLink = moreButtonRawLink
      ? `${url}#lb_api=${moreButtonRawLink}`
      : null;

    smartBlocks.push({
      type,
      items,
      moreButtonLink,
      moreButtonRawLink,
      index: blockIndex,
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




