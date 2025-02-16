"use client";

import { Mypage } from "@/features/post-generation/components/mypage";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      {/* 상단 헤더 */}
      <h1 className="sticky top-0 font-bold bg-white z-10 p-4 shadow-md">
        마이페이지
      </h1>

      {/* 전체 페이지 스크롤 가능 */}
      <div className="flex-1">
        <Mypage />
      </div>
    </div>
  );
}
