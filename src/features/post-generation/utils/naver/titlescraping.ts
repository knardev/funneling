// app/lib/utils/fetchAndClassifySections.ts
//내가 개발한 것.
// api_subject_bx로 순서 가져옴


import * as cheerio from 'cheerio';
import { Section } from '@/features/post-generation/types'; 
// ↑ 기존에 Section 타입 정의해놓은 곳에 맞춰 import 경로 수정

export async function fetchTitleScraping(keyword: string): Promise<Section[]> {
  const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(keyword)}`;

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    // 요청 실패 시 에러 throw
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const sections: Section[] = [];
  let sectionOrder = 1; // 섹션 순서를 나타내는 변수
  const addedTitles = new Set<string>(); // 중복 방지

  $('.api_subject_bx').each((_, element) => {
    try {
      // 🟡 **1. 탭 제목 추출 (그대로 유지)**
      const headlineTitle = $(element).find('.fds-comps-header-headline').text().trim();
      const modTitle = $(element).find('.mod_title_area .title_wrap h2.title').text().trim();

      // 🟡 **2. sectionType 결정 (그대로 유지)**
      let sectionType: Section['type'] = '기타';

      if (headlineTitle) {
        if (headlineTitle.includes('인플루언서 콘텐츠')) {
          sectionType = '인플루언서';
        } else if (headlineTitle.includes('인기주제')) {
          sectionType = '인기주제';
        } else if (headlineTitle.includes('인기글')) {
          sectionType = '인기글';
        } else if (headlineTitle.includes('브랜드 콘텐츠')) {
          sectionType = '브랜드';
        } else {
          sectionType = '블로그';
        }
      }

      if (modTitle) {
        if (modTitle.includes('인기글')) {
          sectionType = '인기글';
        } else {
          sectionType = '기타';
        }
      }

      // // 🟡 **3. 로그 출력 (디버깅용)**
      // console.log("headlineTitle:", headlineTitle);
      // console.log("modTitle:", modTitle);
      // console.log("sectionType:", sectionType);

      // 🟡 **4. 블로그 및 인기글 섹션 제목 추출**
      if (sectionType === '블로그' || sectionType === '인기글') {
        // 🔹 **제목을 저장할 배열 초기화**
        const titles: string[] = [];

        // 🔹 **첫 번째 셀렉터 사용 (기존 유지)**
        $(element).find('a.owCTqYV11FM4EzUZLLYI.fds-comps-right-image-text-title > span').each((_, titleElement) => {
          const title = $(titleElement).text().trim() || '제목 없음';
          if (!addedTitles.has(title)) {
            titles.push(title);
            addedTitles.add(title);
          }
        });

        // 🔹 **두 번째 셀렉터(JSPath 기반 추가 셀렉터) 사용**
        $(element).find('div > div > a.owCTqYV11FM4EzUZLLYI.fds-comps-right-image-text-title > span').each((_, titleElement) => {
          const title = $(titleElement).text().trim() || '제목 없음';
          if (!addedTitles.has(title)) {
            titles.push(title);
            addedTitles.add(title);
          }
        });

        // 🔹 **세 번째 셀렉터(JSPath 기반 추가 셀렉터) 사용**
        $(element).find('div.fds-comps-right-image-desktop.fds-comps-right-image-type-snippet-image.fds-ugc-body > a > span').each((_, titleElement) => {
          const title = $(titleElement).text().trim() || '제목 없음';
          if (!addedTitles.has(title)) {
            titles.push(title);
            addedTitles.add(title);
          }
        });

        // 🔹 **네 번째 셀렉터(JSPath 기반 추가 셀렉터) 사용**
        $(element).find('div.fds-comps-right-image-desktop.fds-comps-right-image-type-snippet-basic.fds-ugc-body > a > span').each((_, titleElement) => {
          const title = $(titleElement).text().trim() || '제목 없음';
          if (!addedTitles.has(title)) {
            titles.push(title);
            addedTitles.add(title);
          }
        });

        // 🔹 **제목이 있는 경우 섹션 추가**
        if (titles.length > 0) {
          sections.push({
            order: sectionOrder,
            Tapname: headlineTitle || modTitle || '제목 없음',
            type: sectionType,
            titles,
          });
        }

        // 🔹 **섹션 순서 증가**
        sectionOrder++;
      } else {
        // 🟡 **블로그 및 인기글이 아닌 섹션의 경우 섹션 순서만 증가**
        sectionOrder++;
      }
    } catch (error) {
      console.error('Error processing section:', error);
      // 섹션 순서 증가
      sectionOrder++;
    }
  });

  return sections;
}
