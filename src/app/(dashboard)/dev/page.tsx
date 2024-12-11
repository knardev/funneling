import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Page() {
  return (
    <div className="h-full flex flex-col">
      <h1>플레이그라운드</h1>
      <div className="h-full bg-slate-800">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={25} maxSize={25} className="p-4">
            <h2>콘텐츠 세팅</h2>
          </ResizablePanel>
          <ResizableHandle className="bg-slate-300" />
          <ResizablePanel minSize={75} maxSize={75} className="p-4">
            <h2>디버깅</h2>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
