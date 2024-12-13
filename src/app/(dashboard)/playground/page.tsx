import { PlaygroundPanel } from "@/features/post-generation/components/playground-panel";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">플레이그라운드</h1>
      <div className="flex-1 overflow-y-auto">
        <PlaygroundPanel />
      </div>
    </div>
  );
}
