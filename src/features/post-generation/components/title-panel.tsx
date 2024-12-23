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
import { generateTitle } from "@/features/post-generation/actions/content/generate_title";
import { scrapeNaverSections } from "@/features/post-generation/actions/others/counting_smartblock";
import { Analysis, Section } from "../types";

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
  const [sections, setSections] = useState<Section[]>([]);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  // 스크래핑 전용 핸들러 추가
  const handleScraping = async () => {
    updateLog("네이버 검색 결과 스크래핑 시작...");
    setIsScrapingLoading(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: mainkeyword }),
      });

      if (!response.ok) {
        throw new Error("스크래핑 실패");
      }

      const { sections: scrapedSections } = await response.json();
      setSections(scrapedSections);
      updateLog(`스크래핑 완료: ${scrapedSections.length}개 섹션 발견`);
    } catch (error) {
      console.error("스크래핑 중 오류:", error);
      updateLog(`오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setIsScrapingLoading(false);
    }
  };

  // 제목 생성 핸들러 수정 (스크래핑 부분 제거)
  const handleGenerateTitle = async () => {
    updateLog("제목 생성 시작...");
    try {
      const result = await generateTitle(mainkeyword, subkeywordlist, serviceAnalysis);
      setTitles(result.optimizedTitles);
      setSubKeywords(result.selected_subkeywords);
      setExtractedTitles(result.extractedTitles);
      updateLog("제목 생성 완료");
    } catch (error) {
      console.error("제목 생성 중 오류:", error);
      updateLog(`오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    }
  };

  // Reset states 함수 수정
  const handleResetStates = () => {
    setMainKeyword("");
    setSubKeywords([]);
    setSubKeywordlist(null);
    setTitles([]);
    setExtractedTitles([]);
    setDebugLogs([]);
    setSections([]);  // 섹션 정보도 초기화
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
                placeholder="키워드를 입력하세요"
                value={mainkeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleScraping}
                disabled={isScrapingLoading}
                variant="outline"
              >
                {isScrapingLoading ? "스크래핑 중..." : "스마트블록 추출"}
              </Button>
              <Button onClick={handleGenerateTitle}>
                제목 생성
              </Button>  
              <Button onClick={handleResetStates} variant="secondary">
                초기화
              </Button>
            </div>

            {/* 스크래핑 결과 표시 위치 이동 */}
            {sections.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">스마트블록 섹션</h3>
                 <pre>키워드 검색 결과 상위노출 순서입니다.</pre>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">순서</th>
                      <th className="border p-2">유형</th>
                      <th className="border p-2">제목</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <tr key={section.order}>
                        <td className="border p-2">{section.order}</td>
                        <td className="border p-2">{section.type}</td>
                        <td className="border p-2">{section.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
            <pre>
              상위 노출 블로그 제목: {extractedTitles.length > 0
                ? extractedTitles.map((title, index) => (
                    <div key={index}>
                      {index + 1}. {title}
                      <br />
                    </div>
                  ))
                : "No extracted titles"}
            </pre>
          </div>
          <div className="mt-4">
            <h3>실행 로그:</h3>
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
