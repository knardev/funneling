"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isResultReady, setIsResultReady] = useState(false);

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
    setIsResultReady(false);

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
      setIsResultReady(true); // 결과 표시 상태 업데이트
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




    return (
      <div className="h-full">
        <ResizablePanelGroup direction="horizontal">
          {/* 사이드바 */}
          <ResizablePanel defaultSize={3} minSize={3} maxSize={10} className="bg-gray-100 p-2">
            <ul className="space-y-1">
              <li>
                <a href="/keywordextract" className="block px-2 py-1 rounded-md hover:bg-gray-200">
                  키워드 생성
                </a>
              </li>
              <li>
                <a href="/title" className="block px-2 py-1 rounded-md hover:bg-gray-200">
                  제목 생성
                </a>
              </li>
              <li>
                <a href="/trafficcontent" className="block px-2 py-1 rounded-md hover:bg-gray-200">
                  컨텐츠 생성
                </a>
              </li>
            </ul>
          </ResizablePanel>
  
          <ResizableHandle />
  
          {/* 메인 콘텐츠 */}
          <ResizablePanel defaultSize={75} maxSize={85} className="p-4 flex flex-col gap-4  overflow-auto">
            {/* 키워드 입력 섹션 */}
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">키워드</h2>
                <div className="flex flex-col gap-2">
                <Input
                  placeholder="키워드를 입력하세요"
                  value={mainkeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleScrapeAndGenerateTitle();
                  }
                  }}
                />
                <Button
                  onClick={handleScrapeAndGenerateTitle}
                  disabled={isLoading}
                  variant="default"
                  className="w-full py-2 text-lg font-medium !important"
                >
                  {isLoading ? (
                  <>
                  <span className="animate-spin mr-2">⚪</span>
                  제목 생성 중...
                  </>
                  ) : (
                  '제목 생성하기'
                  )}
                </Button>
                </div>
            </div>
  
            {/* 결과 섹션 (제목과 검색 결과 동시에 표시) */}
            {isResultReady && (
            <div className="overflow-auto max-h-[400px] border rounded-md p-4">
                {/* Tabs 섹션 */}
                <div className="border-b pb-4 mb-4">
                  <Tabs defaultValue="strict">
                    <TabsList className="mb-4">
                      <TabsTrigger value="strict">상위 패턴</TabsTrigger>
                      <TabsTrigger value="creative">서브 키워드 활용</TabsTrigger>
                      <TabsTrigger value="style">결핍 자극</TabsTrigger>
                    </TabsList>
  
                    {/* 상위 패턴 제목 */}
                    {strictTitles.length > 0 && (
                      <TabsContent value="strict">
                        <h3 className="font-bold mb-2">상위 패턴 제목</h3>
                        <ul className="list-disc ml-4 space-y-1">
                          {strictTitles.map((title, index) => (
                            <li key={index}>{index + 1}. {title}</li>
                          ))}
                        </ul>
                      </TabsContent>
                    )}
  
                    {/* 서브 키워드 활용 제목 */}
                    {creativeTitles.length > 0 && (
                      <TabsContent value="creative">
                        <h3 className="font-bold mb-2">서브 키워드 활용 제목</h3>
                        <ul className="list-disc ml-4 space-y-1">
                          {creativeTitles.map((title, index) => (
                            <li key={index}>{index + 1}. {title}</li>
                          ))}
                        </ul>
                      </TabsContent>
                    )}
  
                    {/* 결핍 자극 제목 */}
                    {styleTitles.length > 0 && (
                      <TabsContent value="style">
                        <h3 className="font-bold mb-2">결핍 자극 제목</h3>
                        <ul className="list-disc ml-4 space-y-1">
                          {styleTitles.map((title, index) => (
                            <li key={index}>{index + 1}. {title}</li>
                          ))}
                        </ul>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
  
                {/* 검색 결과 섹션 */}
                <div className="border-t pt-4 overflow-auto">
                  <h2 className="text-lg font-bold mb-2">검색 결과</h2>
                  {serpdata.smartBlocks.map((block: any, index: number) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-bold">{block.index}번째 탭: {block.type || "알 수 없는 타입"}</h4>
                      <ul className="list-disc ml-4">
                        {block.items?.map((item: any, rank: number) => (
                          <li key={rank}>{rank + 1}. {item.postTitle || "제목 없음"}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }