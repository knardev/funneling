


// 첫 번째 fetch 함수: 네이버 블로그 검색결과에서 제목 영역의 텍스트를 추출
export async function fetchBlogTitles(keyword: string) {
    const url = `https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query=${encodeURIComponent(keyword)}`;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
        }
    };
 
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data. HTTP response code: ' + response.status);
        }
 
        return await response.text();
    } catch (error) {
        console.error(`Error fetching blog titles for keyword ${keyword}: ${error.message}`);
        throw error;
    }
 }
 
 // 두 번째 fetch 함수: 네이버 일반 검색결과에서 추가 정보를 추출
 export async function fetchGeneralSearch(keyword: string) {
    const url = `https://search.naver.com/search.naver?sm=tab_jum&query=${encodeURIComponent(keyword)}&extra_param=example`;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
        }
    };
 
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error('Failed to fetch additional data. HTTP response code: ' + response.status);
        }
 
        return await response.text();
    } catch (error) {
        console.error(`Error fetching general search for keyword ${keyword}: ${error.message}`);
        throw error;
    }
 }

  // 두 함수를 하나의 유틸리티 객체로 export
  export const naverUtils = {
    fetchBlogTitles,
    fetchGeneralSearch
 };