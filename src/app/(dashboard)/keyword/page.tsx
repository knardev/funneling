'use client'
import { Button } from "@/components/ui/button";
import { TitlePanel } from "@/features/post-generation/components/title-panel";
import { useRouter } from "next/navigation";
import { KeywordPanel } from "@/features/post-generation/components/keyword-panel";

export default function Page() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 font-bold bg-white z-10 p-4 shadow-md">키워드 ㅊㅊ</h1>
      <div className="flex-1 overflow-y-auto">
        <KeywordPanel />
      </div>
    </div>
  );
}
    


