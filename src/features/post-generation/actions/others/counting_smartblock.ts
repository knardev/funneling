// import puppeteer, { Browser, Page } from 'puppeteer';
// import { Section } from '../../types';


// /**
//  * 네이버 검색 결과 페이지에서 섹션 정보를 추출하는 함수
//  * @param keyword - 검색할 키워드
//  * @returns 섹션 정보 배열
//  */
// export async function scrapeNaverSections(keyword: string): Promise<Section[]> {
//     let browser: Browser | null = null;
//     const sections: Section[] = [];

//     try {
//         // 1. Puppeteer 브라우저 실행
//         browser = await puppeteer.launch({
//             headless: true, // 브라우저를 띄우지 않고 실행 (디버깅 시 false로 변경)
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         });

//         const page: Page = await browser.newPage();

//         // 2. 사용자 에이전트 설정 (옵션)
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//             'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//             'Chrome/91.0.4472.124 Safari/537.36');

//         // 3. 네이버 검색 페이지로 이동
//         const searchUrl = `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(keyword)}`;
//         await page.goto(searchUrl, { waitUntil: 'networkidle2' });

//         // 4. 특정 요소가 로드될 때까지 대기
//         await page.waitForSelector('.api_subject_bx', { timeout: 10000 }); // 최대 10초 대기

//         // 5. 모든 탭(섹션) 요소 추출
//         const extractedSections: Section[] = await page.evaluate(() => {
//             const subjectBoxes = Array.from(document.querySelectorAll('.api_subject_bx'));
//             const result: Section[] = [];

//             subjectBoxes.forEach((box, index) => {
//                 // 섹션 제목 추출
//                 const titleElement = box.querySelector('.fds-comps-header-headline');
//                 const tabTitle = titleElement ? (titleElement as HTMLElement).innerText.trim() : '제목 없음';

//                 // 섹션 유형 결정
//                 let sectionType: Section['type'] = '기타';
//                 if (titleElement) {
//                     if (tabTitle.includes('인플루언서 콘텐츠')) {
//                         sectionType = '인플루언서';
//                     } else if (tabTitle.includes('인기글')) {
//                         sectionType = '인기';
//                     } else if (tabTitle.includes('브랜드 콘텐츠')) {
//                         sectionType = '브랜드';
//                     } else {
//                         sectionType = '블로그';
//                     }
//                 }
//                 if (sectionType !== '기타' && !tabTitle.includes('인기주제')) {
//                     result.push({
//                         order: index + 1, // 순서는 1부터 시작
//                         title: tabTitle,
//                         type: sectionType
//                     });
//                 }
//             });

//             return result;
//         });

//         // 6. 섹션 정보 반환
//         return extractedSections;

//     } catch (error) {
//         console.error("스크래핑 중 오류 발생:", error);
//         return sections; // 빈 배열 반환
//     } finally {
//         // 7. 브라우저 종료
//         if (browser) {
//             await browser.close();
//         }
//     }
// }

