import { BrandPanel } from "@/features/post-generation/components/brand-panel";

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <h1 className="sticky top-0 bg-white z-10 p-4 shadow-md">브랜드 컨텐츠</h1>
      <div className="flex-1 overflow-y-auto">
        <BrandPanel />
      </div>
    </div>
  );
}
