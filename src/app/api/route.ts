// src/app/api/route.ts

// 기존 함수를 별도의 함수로 분리
async function fetchHomepages() {
    // 기존 로직
  }
  
  // API 라우트 핸들러
  export async function GET() {
    try {
      await fetchHomepages();
      return new Response('Success', { status: 200 });
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  }
  
  // POST나 다른 메서드가 필요하다면
  