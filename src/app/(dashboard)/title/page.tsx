"use client";

import { TitlePanel } from "@/features/post-generation/components/title-panel";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      {/* 상단 헤더 */}
      <h1 className="sticky top-0 font-bold bg-white z-10 p-4 shadow-md">
        제목 생성
      </h1>

      {/* 전체 페이지 스크롤 가능 */}
      <div className="flex-1">
        <TitlePanel />
      </div>
    </div>
  );
}
