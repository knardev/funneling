"use client";

import { Feedback } from "@/features/post-generation/components/feedback-panel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      {/* 상단 헤더 */}
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">
        피드백
      </h1>

      {/* 전체 페이지 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto">
       <Feedback />
      </div>
    </div>
  );
}
