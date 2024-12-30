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
import { Analysis, SerpData, SmartBlockItem, SmartBlock } from "../types";

export function TitlePanel() {
  // Input states
  const [mainkeyword, setMainKeyword] = useState("");
  const [subkeywords, setSubKeywords] = useState<string[]>([]);
  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null,
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<string[]>([]);
  const [serpdata, setserpdata] = useState<SerpData>({
    smartBlocks: [],
    popularTopics: [],
    basicBlock: [],
  });
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

  // 스크래핑 핸들러
  const handleScraping = async () => {
    updateLog("네이버 검색 결과 스크래핑 시작...");
    setIsScrapingLoading(true);
    try {
      const response = await fetch("/api/scrapping-serp-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: mainkeyword }),
      });

      if (!response.ok) {
        throw new Error(`스크래핑 실패: ${response.status}`);
      }

      const { smartBlocks, popularTopics, basicBlock } = await response.json();

      if (!smartBlocks || smartBlocks.length === 0) {
        updateLog("스크래핑 결과가 없습니다.");
        return;
      }

      const validSmartBlocks = smartBlocks.filter(
        (block: SmartBlock) =>
          block.items &&
          block.items.length > 0 &&
          block.items.some(item => item.postTitle !== null)
      );

      setserpdata({
        smartBlocks: validSmartBlocks,
        popularTopics,
        basicBlock,
      });

      updateLog(`스크래핑 완료: ${validSmartBlocks.length}개 섹션 발견`);
    } catch (error) {
      console.error("스크래핑 중 오류:", error);
      updateLog(
        `오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    } finally {
      setIsScrapingLoading(false);
    }
  };

  // 제목 생성 핸들러
  const handleGenerateTitle = async () => {
    updateLog("제목 생성 시작...");
    try {
      const result = await generateTitle(
        mainkeyword,
        subkeywordlist,
        serviceAnalysis
      );
      setTitles(result.optimizedTitles);
      setSubKeywords(result.selected_subkeywords);
      setExtractedTitles(result.extractedTitles);
      updateLog("제목 생성 완료");
    } catch (error) {
      console.error("제목 생성 중 오류:", error);
      updateLog(
        `오류 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
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
    setserpdata({ smartBlocks: [], popularTopics: [], basicBlock: [] });
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
              <Button onClick={handleGenerateTitle}>제목 생성</Button>
              <Button onClick={handleResetStates} variant="secondary">
                초기화
              </Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-slate-300" />
        <ResizablePanel
          defaultSize={75}
          maxSize={75}
          className="p-4 flex flex-col gap-4"
        >
          <div className="flex-1 overflow-y-auto mt-4">
            <h2 className="text-lg font-bold">키워드: {mainkeyword}</h2>
            <h2>
              서브키워드: {subkeywords.join(", ") || "No subkeywords"}
            </h2>
            <h2>
              상위 패턴 제목:
              {titles.length > 0 &&
                titles.slice(0, 3).map((title, index) => (
                  <div key={index}>
                    {index + 1}. {title}
                  </div>
                ))}
            </h2>
            <h2>
              서브키워드 활용 제목:
              {titles.length > 3 &&
                titles.slice(3, 6).map((title, index) => (
                  <div key={index}>
                    {index + 1}. {title}
                  </div>
                ))}
            </h2>
            <hr />
            <br />
            <div>
              <h2 className="text-lg font-bold mb-4">키워드 검색 결과 상위 노출 순서</h2>
                {serpdata.smartBlocks.map((block: SmartBlock) => (
                <div key={block.index} className="mb-4">
                  <h3 className="font-bold text-md">
                    {block.index + 1}번째 탭: {block.type || "알 수 없는 타입"}
                  </h3>
                  <div className="ml-4">
                    {block.items && block.items.length > 0 ? (
                      block.items.map((item: SmartBlockItem, index: number) => (
                        <p key={index}>
                          {index + 1}. {item.postTitle || "제목 없음"}
                        </p>
                      ))
                    ) : (
                      <p>유효한 항목이 없습니다.</p>
                    )}
                  </div>
                  <br />
                </div>
              ))}

            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
