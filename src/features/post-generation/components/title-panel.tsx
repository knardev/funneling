"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Import your server actions
import { generateTitle } from "@/features/post-generation/actions/content/generate_title";
import { Analysis } from "../types";

export function TitlePanel() {
  // Input states
  const [mainkeyword, setMainKeyword] = useState("");
  const [subkeywords, setSubKeywords] = useState<string[]>([]);
  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<string[]>([]);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  // Generate Title
  const handleGenerateTitle = async () => {
    updateLog("제목 생성 중...");
    try {
      const result = await generateTitle(mainkeyword, subkeywordlist, serviceAnalysis);
      setTitles(result.optimizedTitles);
      setSubKeywords(result.selected_subkeywords);
      setExtractedTitles(result.extractedTitles);
      updateLog("제목 생성 완료");
    } catch (error) {
      console.error("제목 생성 오류:", error);
      updateLog("제목 생성 오류");
    }
  };

  // Reset all states
  const handleResetStates = () => {
    setMainKeyword("");
    setSubKeywords([]);
    setSubKeywordlist(null);
    setTitles([]);
    setDebugLogs([]);
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} maxSize={25}>
          <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
            <h2>초기 입력</h2>
            <div>
              <Label>키워드</Label>
              <Input
                placeholder="Enter keyword"
                value={mainkeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerateTitle}>제목 생성</Button>  
              <Button onClick={handleResetStates}>초기화</Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-slate-300" />
        <ResizablePanel
          defaultSize={75}
          maxSize={75}
          className="p-4 flex flex-col gap-4"
        >
          <h2>Debug Panel</h2>
          <div className="mt-4 space-y-2 text-sm">
            <pre>키워드: {mainkeyword}</pre>
            <pre>서브키워드: {subkeywords.join(", ") || "No subkeywords"}</pre>
            <pre>
                제목:
                {titles.length > 0
                    ? titles.map((title, index) => (
                        <div key={index}>
                        {index + 1}. {title}
                        <br />
                        </div>
                    ))
                : "No titles"}
            </pre>
            <pre>상위 노출 블로그 제목: {extractedTitles.length > 0
             ? extractedTitles.map((title, index) => (
                <div key={index}>
                {index + 1}. {title}
                <br />
                </div>
            )) : "No extracted titles"}</pre>
          </div>
          <div className="mt-4">
            <h3>Execution Logs:</h3>
            <div className="text-sm">
              {debugLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
