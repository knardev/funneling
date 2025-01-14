'use client'
import { TrafficPanel } from "@/features/post-generation/components/traffic-panel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Page() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky font-bold top-0 bg-white z-10 p-4 shadow-md">정보성글 ㅊㅊ</h1>
      <div className="flex-1">
        <TrafficPanel />  
      </div>
    </div>
  );
}
