'use client'
import { Button } from "@/components/ui/button";
import { TitlePanel } from "@/features/post-generation/components/title-panel";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">제목 생성</h1>
      <div className="flex justify-start">
      <Button onClick={() => router.push("/trafficcontent")}>컨텐츠 생성하러가기</Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <TitlePanel />
      </div>
    </div>
  );
}
    