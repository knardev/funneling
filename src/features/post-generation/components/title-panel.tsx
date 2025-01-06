"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateTitle } from "@/features/post-generation/actions/content/generate_title";
import {
  Analysis,
  SerpData,
  SmartBlockItem,
  SmartBlock,
  ScrapingResults,
} from "../types";
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

  // 제목 관련 상태
  const [strictTitles, setStrictTitles] = useState<string[]>([]);
  const [creativeTitles, setCreativeTitles] = useState<string[]>([]);
  const [styleTitles, setStyleTitles] = useState<string[]>([]);
  const [extractedTitles, setExtractedTitles] = useState<string[]>([]);

  // 스크래핑 상태
  const [serpdata, setSerpdata] = useState<SerpData>({ smartBlocks: [] });
  const [scrapingResults, setScrapingResults] = useState<ScrapingResults>([]);

  // 로딩
  const [isLoading, setIsLoading] = useState(false);

  // 스크래핑 + 제목 생성
  const handleScrapeAndGenerateTitle = async () => {
    setIsLoading(true);
    setIsResultReady(false);

    try {
      // 1. 초기화
      const initResult = await initializeContent(mainkeyword);
      if (
        initResult.subkeywordlist.relatedTerms &&
        initResult.subkeywordlist.relatedTerms.length > 0
      ) {
        setSubKeywordlist(initResult.subkeywordlist.relatedTerms);
      } else if (
        initResult.subkeywordlist.autocompleteTerms &&
        initResult.subkeywordlist.autocompleteTerms.length > 0
      ) {
        setSubKeywordlist(initResult.subkeywordlist.autocompleteTerms);
      } else {
        setSubKeywordlist(null);
      }

      // 2. 스크래핑
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
        setIsLoading(false);
        return;
      }

      const validSmartBlocks = smartBlocks.filter(
        (block: SmartBlock) =>
          block.items &&
          block.items.length > 0 &&
          block.items.some((item) => item.postTitle !== null)
      );

      setSerpdata({ smartBlocks: validSmartBlocks });

      // 검색 결과 그룹화
      const groupedResults = validSmartBlocks.reduce(
        (
          acc: {
            index: number;
            type: string;
            scrapedtitle: { rank: number; postTitle: string }[];
          }[],
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

      setScrapingResults(groupedResults);

      // 3. 제목 생성
      const generateResult = await generateTitle(
        mainkeyword,
        initResult.subkeywordlist.relatedTerms ||
          initResult.subkeywordlist.autocompleteTerms ||
          [],
        groupedResults,
        initResult.serviceanalysis
      );

      setStrictTitles(generateResult.optimizedTitles.strict_structure || []);
      setCreativeTitles(generateResult.optimizedTitles.creative_structure || []);
      setStyleTitles(generateResult.optimizedTitles.style_patterns || []);
      setSubKeywords(generateResult.selected_subkeywords || []);
      setExtractedTitles(generateResult.extractedTitles || []);

      setIsResultReady(true);
    } catch (error) {
      console.error("에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel 
          defaultSize={20}  // 패널 기본 너비 (퍼센트 또는 픽셀 단위)
          minSize={15}      // 최소 너비 (퍼센트 또는 픽셀 단위)
          maxSize={25}
          className="bg-gray-100 p-2 overflow-y-auto">
        <ul className="space-y-1 w-[150px]"> {/* 원하는 너비로 조정 */}
            <li>
              <a
                href="/title"
                className="block px-2 py-1 rounded-md hover:bg-gray-200  truncate"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                제목 생성
              </a>
            </li>
            <li>
              <a
                href="/feedback"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                피드백
              </a>
            </li>
          </ul>
        </ResizablePanel> */}

        <ResizableHandle />

        {/* 메인 패널: 세로 스크롤 가능 */}
        <ResizablePanel
          defaultSize={75}
          maxSize={85}
          className="p-4 flex flex-col gap-4 overflow-y-auto"
        >
          {/* 키워드 입력 */}
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-2">키워드 입력</h2>

            <div className="flex flex-col gap-2">
              <Input
                placeholder="키워드를 입력하세요"
                value={mainkeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleScrapeAndGenerateTitle();
                  }
                }}
              />
              <Button
                onClick={handleScrapeAndGenerateTitle}
                disabled={isLoading}
                variant="default"
                className="w-full py-2 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⚪</span>
                    제목 생성 중...
                  </>
                ) : (
                  "제목 생성하기"
                )}
              </Button>
            </div>
          </div>

          {/* 결과 섹션 */}
          {isResultReady && (
            <>
              {/* 제목 섹션: 가로 스크롤 */}
              <div className="border rounded-md p-4">
                <h2 className="text-lg font-bold mb-4">제목 추천</h2>
                <div className="flex space-x-4 overflow-x-auto">
                  {/* 상위 패턴 */}
                  {strictTitles.length > 0 && (
                    <div className="border rounded-md p-3 min-w-[300px] flex-shrink-0 m-3 mr-2">
                      <h3 className="font-bold mb-2">상위 패턴 제목</h3>
                      <ul className="list-disc ml-4 space-y-1">
                        {strictTitles.map((title, index) => (
                          <li key={index}>
                            {index + 1}. {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 서브 키워드 활용 */}
                  {creativeTitles.length > 0 && (
                    <div className="border rounded-md p-3 min-w-[300px] flex-shrink-0 m-3 mr-2">
                      <h3 className="font-bold mb-2">서브 키워드 활용</h3>
                      <ul className="list-disc ml-4 space-y-1">
                        {creativeTitles.map((title, index) => (
                          <li key={index}>
                            {index + 1}. {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 결핍 자극 */}
                  {styleTitles.length > 0 && (
                    <div className="border rounded-md p-3 min-w-[300px] flex-shrink-0 m-3">
                      <h3 className="font-bold mb-2">결핍 자극 제목</h3>
                      <ul className="list-disc ml-4 space-y-1">
                        {styleTitles.map((title, index) => (
                          <li key={index}>
                            {index + 1}. {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 서브 키워드 */}
                {subkeywordlist && subkeywordlist.length > 0 && (
                  <div className="border-t mt-4 pt-3">
                    <h3 className="font-bold mb-2">서브 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {subkeywordlist.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block px-4 py-1 bg-gray-200 text-sm rounded-md border border-gray-300 shadow-sm"
                          style={{ backgroundColor: '#e5e7eb' }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 검색 결과 (스크래핑) */}
              <div className="border-t pl-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">검색 결과</h2>
                {serpdata.smartBlocks.map((block: SmartBlock, i: number) => (
                  <div key={i} className="mb-4">
                    <h4 className="font-bold">
                      {block.index}번째 탭: {block.type || "알 수 없는 타입"}
                    </h4>
                    <ul className="list-disc ml-4">
                      {block.items?.map((item: SmartBlockItem, rank: number) => (
                        <li key={rank}>
                          {rank + 1}. {item.postTitle || "제목 없음"}
                        </li>
                      ))}
                    </ul>
                    <br></br>
                  </div>
                ))}
              </div>
            </>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
