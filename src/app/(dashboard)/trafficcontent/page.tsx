import { TrafficPanel } from "@/features/post-generation/components/traffic-panel";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">트래픽 컨텐츠</h1>
      <div className="flex-1 overflow-y-auto">
        <TrafficPanel />
      </div>
    </div>
  );
}