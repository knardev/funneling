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
  TitleResult,
} from "../types";
import { initializeContent } from "@/features/post-generation/actions/others/initialize_content";
import { SidePanel } from "./side-panel";
import { saveTitleResult } from "../actions/others/save_titleResult";

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

  const[titleResult, setTitleResult] = useState<TitleResult | null>(null);
  // 로딩
  const [isLoading, setIsLoading] = useState(false);


    const handleSaveTitleResult = async (titleResult: TitleResult) => {
      try {
        await saveTitleResult(titleResult);
      } catch (error) {
        console.error("최종 결과 저장 오류:", error);
      }
    };

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
        setIsResultReady(true);
        setScrapingResults([]); // 검색 결과 없는 상태
        return;                 // 더 이상 진행하지 않음
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

      // 그룹화한 결과도 비어있다면 안내 후 종료
      if (groupedResults.length === 0) {
        setScrapingResults([]);
        setIsLoading(false);
        setIsResultReady(true);
        return;
      }

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


      const titleResult: TitleResult = {
        ...generateResult.optimizedTitles,
        keyword: mainkeyword
      }

      const TitleResultData = {
        keyword: titleResult.keyword,
        strict_structure: titleResult.strict_structure,
        creative_structure: titleResult.creative_structure,
        style_patterns: titleResult.style_patterns,
      };

      setStrictTitles(generateResult.optimizedTitles.strict_structure || []);
      setCreativeTitles(generateResult.optimizedTitles.creative_structure || []);
      setStyleTitles(generateResult.optimizedTitles.style_patterns || []);
      setSubKeywords(generateResult.selected_subkeywords || []);
      setExtractedTitles(generateResult.extractedTitles || []);

      handleSaveTitleResult(TitleResultData);
      setIsResultReady(true);
    } catch (error) {
      console.error("에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <SidePanel />

        <ResizableHandle />

        <ResizablePanel
          defaultSize={85}
          maxSize={85}
          className="p-4 flex flex-col gap-4"
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
              {/* scrapingResults가 비어있으면 안내 문구 */}
              {scrapingResults.length === 0 ? (
                <div className="text-red-500 font-bold my-4">
                  검색 결과 첫 페이지에 블로그가 없습니다
                </div>
              ) : (
                <>
                  {/* 제목 섹션: 가로 스크롤 */}
                  <div className="border rounded-md p-4">
                    <h2 className="text-lg font-bold">제목 추천</h2>
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

                  {/* 검색 결과 영역 */}
                  <div className="border-t pl-4">
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
            </>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
