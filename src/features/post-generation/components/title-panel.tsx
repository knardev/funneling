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
import { Analysis, SerpData, SmartBlockItem, SmartBlock, ScrapingResults } from "../types";
import { initializeContent } from "@/features/post-generation/actions/others/initialize_content";

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

  // State 수정
  const [strictTitles, setStrictTitles] = useState<string[]>([]);
  const [creativeTitles, setCreativeTitles] = useState<string[]>([]);
  const [styleTitles, setStyleTitles] = useState<string[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<string[]>([]);
  const [serpdata, setSerpdata] = useState<SerpData>({
    smartBlocks: [],
  });
  const [isLoading, setIsLoading] = useState(false); // 통합 로딩 상태
  const [scrapingResults, setScrapingResults] = useState<ScrapingResults>([]);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };


  // 통합 핸들러: 스크래핑 후 제목 생성
  const handleScrapeAndGenerateTitle = async () => {
    updateLog("스크래핑 및 제목 생성 프로세스 시작...");
    setIsLoading(true);
    handleResetStates(); // 상태 초기화

    try {
      // 1. 초기화 실행
      updateLog("초기화 중...");
      const initResult = await initializeContent(mainkeyword);
      setSubKeywordlist(initResult.subkeywordlist);
      updateLog(`콘텐츠 초기화됨`);

      // 2. 스크래핑 시작
      updateLog("네이버 검색 결과 스크래핑 시작...");
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

      const { smartBlocks } = await response.json();

      if (!smartBlocks || smartBlocks.length === 0) {
        updateLog("스크래핑 결과가 없습니다.");
        return;
      }

      const validSmartBlocks = smartBlocks.filter(
        (block: SmartBlock) =>
          block.items &&
          block.items.length > 0 &&
          block.items.some((item) => item.postTitle !== null)
      );

      setSerpdata({ smartBlocks: validSmartBlocks });

      // ✅ 그룹화된 구조로 변환
      const groupedResults = validSmartBlocks.reduce(
        (
          acc: { index: number; type: string; scrapedtitle: { rank: number; postTitle: string }[] }[],
          block: SmartBlock
        ) => {
          let existingGroup = acc.find(
            (group) => group.index === block.index && group.type === block.type
          );

          if (!existingGroup) {
            existingGroup = {
              index: block.index,
              type: block.type || "알 수 없는 타입",
              scrapedtitle: [],
            };
            acc.push(existingGroup);
          }

          block.items.forEach((item: SmartBlockItem) => {
            if (item.postTitle) {
              existingGroup.scrapedtitle.push({
                rank: item.rank,
                postTitle: item.postTitle,
              });
            }
          });

          return acc;
        },
        []
      );

      console.log("groupedResults:", JSON.stringify(groupedResults, null, 2));
      setScrapingResults(groupedResults);

      updateLog(
        `스크래핑 완료: ${validSmartBlocks.length}개 섹션 발견, ${groupedResults.length}개 그룹화됨`
      );

      // 3. 제목 생성 시작
      updateLog("제목 생성 시작...");
      const generateResult = await generateTitle(
        mainkeyword,
        initResult.subkeywordlist,
        groupedResults,
        initResult.serviceanalysis
      );
      console.log("selected_subkeywords:", generateResult.selected_subkeywords);

      setStrictTitles(generateResult.optimizedTitles.strict_structure || []);
      setCreativeTitles(generateResult.optimizedTitles.creative_structure || []);
      setStyleTitles(generateResult.optimizedTitles.style_patterns || []);
      setSubKeywords(generateResult.selected_subkeywords || []);
      setExtractedTitles(generateResult.extractedTitles || []);

      console.log("제목 생성 결과:", generateResult);
      updateLog("제목 생성 완료");
    } catch (error) {
      console.error("프로세스 중 오류:", error);
      updateLog(
        `오류 발생: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset states 함수
  const handleResetStates = () => {
    setMainKeyword("");
    setSubKeywords([]);
    setSubKeywordlist(null);
    setStrictTitles([]);
    setCreativeTitles([]);
    setStyleTitles([]);
    setExtractedTitles([]);
    setDebugLogs([]);
    setSerpdata({ smartBlocks: [] });
    setScrapingResults([]);
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
              {/* 통합 버튼으로 변경 */}
              <Button
                onClick={handleScrapeAndGenerateTitle}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "스크래핑 및 생성 중..." : "스크래핑 및 제목 생성"}
              </Button>
              <Button onClick={handleResetStates} variant="secondary">
                초기화
              </Button>
            </div>
            {/* 디버그 로그 표시 (선택 사항) */}
            {/* {debugLogs.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold">디버그 로그:</h3>
                <ul className="list-disc pl-5">
                  {debugLogs.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </div>
            )} */}
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
              {strictTitles.length > 0 &&
                strictTitles.map((title, index) => (
                  <div key={index}>
                    {index + 1}. {title}
                  </div>
                ))}
            </h2>
            <h2>
              서브키워드 활용 제목:
              {creativeTitles.length > 0 &&
                creativeTitles.map((title, index) => (
                  <div key={index}>
                    {index + 1}. {title}
                  </div>
                ))}
            </h2>
            <h2>
              결핍 자극 제목:
              {styleTitles.length > 0 &&
                styleTitles.map((title, index) => (
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
                    {block.index}번째 탭: {block.type || "알 수 없는 타입"}
                  </h3>
                  <div className="ml-4">
                    {block.items && block.items.length > 0 ? (
                      block.items.map((item: SmartBlockItem, rank: number) => (
                        <p key={rank}>
                          {rank + 1}. {item.postTitle || "제목 없음"}
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
