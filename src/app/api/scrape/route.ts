import { NextResponse } from 'next/server';
import {  fetchTitleScraping } from '@/features/post-generation/utils/naver/titlescraping'; 
// ↑ 본인 프로젝트 구조에 맞춰 경로/폴더를 지정해 주세요

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // 실질적인 스크래핑 및 분류 로직은 별도의 함수로 분리
    const sections = await fetchTitleScraping(keyword);

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data' },
      { status: 500 }
    );
  }
}
