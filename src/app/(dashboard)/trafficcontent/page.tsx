'use client'
import { TrafficPanel } from "@/features/post-generation/components/traffic-panel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Page() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">트래픽 컨텐츠</h1>
      <div className="flex justify-start">
        <Button onClick={() => router.push("/title")}>제목 생성하러가기</Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <TrafficPanel />  
      </div>
    </div>
  );
}
