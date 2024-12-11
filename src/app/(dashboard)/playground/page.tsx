import { PlaygroundPanel } from "@/features/post-generation/components/playground-panel";

export default function Page() {
  return (
    <div className="h-full flex flex-col">
      <h1>플레이그라운드</h1>
      <PlaygroundPanel />
    </div>
  );
}
