'use client'
import { Button } from "@/components/ui/button";
import { TitlePanel } from "@/features/post-generation/components/title-panel";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">제목 생성</h1>
      <div className="flex-1 overflow-y-auto">
        <TitlePanel />
      </div>
    </div>
  );
}
    