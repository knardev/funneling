"use client";

import { useState } from "react";
import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// [추가] JSZip, file-saver
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Import your server actions (기존 그대로)
import { initializeContent } from "@/features/post-generation/actions/others/initialize_content";
import { generateToc } from "@/features/post-generation/actions/content/generate_toc";
import { generateIntro } from "@/features/post-generation/actions/content/generate_intro";
import { generateBody } from "@/features/post-generation/actions/content/generate_body";
import { generateConclusion } from "@/features/post-generation/actions/content/generate_conclusion";
import { generateImagePrompt } from "@/features/post-generation/actions/image/generate_imagePrompt";
import { generateImage } from "@/features/post-generation/actions/image/generate_image";
import { saveFinalResult } from "../actions/others/save_finalResult";
import { Analysis, FinalResult } from "../types";
import { saveFeedback } from "../actions/others/saveFeedback";
import { SidePanel } from "./side-panel";

// 진행도 표시 컴포넌트 (기존 그대로)
function ProgressBar({
  progress,
  message,
}: {
  progress: number;
  message: string;
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="mt-3 mb-2 w-full">
      {progress > 0 && progress < 100 && (
        <p className="text-sm text-gray-700 mb-1 font-medium">
          {message} ({clampedProgress}%)
        </p>
      )}
      {progress === 100 && (
        <p className="text-sm mb-1 font-medium">완료되었습니다!</p>
      )}
      <div className="w-full bg-gray-300 h-3 rounded-md">
        <div
          className="bg-blue-500 h-3 rounded-md transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

export function TrafficPanel() {
  // ===================
  // 1) 입력 상태
  // ===================
  const [mainkeyword, setMainKeyword] = useState("");
  const [personaServiceName, setPersonaServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceAdvantages, setServiceAdvantages] = useState("");

  // ===================
  // 2) 결과 상태
  // ===================
  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null,
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [title, setTitle] = useState("");
  const [toc, setToc] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");
  const [imagePrompts, setImagePrompts] = useState<
    { id: string; prompt: string }[]
  >([]);

  // 이미지 배열 + 이미지 객체 형태(유연한 방법)
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [imagesById, setImagesById] = useState<
    Record<string, { id: string; imageUrl: string }>
  >({});

  const [feedback, setFeedback] = useState("");

  // ===================
  // 3) 디버그 로그
  // ===================
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // ===================
  // 4) 진행도
  // ===================
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // ===================
  // 5) 생성 완료 여부
  // ===================
  const [isContentGenerated, setIsContentGenerated] = useState(false);

  // =========================================
  // 0) 전체 state 리셋 함수
  // =========================================
  function resetAllStates() {
    // 생성 결과 상태 초기화
    setSubKeywordlist(null);
    setToc("");
    setIntro("");
    setBody("");
    setConclusion("");
    setUpdatedContent("");
    setImagePrompts([]);
    setImages([]);
    setImagesById({});
    setProgress(0);
    setProgressMessage("");
    setIsContentGenerated(false);
  }


  // =========================================
// [추가] 후처리 함수
// =========================================
function postProcessUpdatedContent(rawContent: string): string {
  let content = rawContent;

  // -------------------------------------
  // 1) 이미 "정확한" 형태인 #[imageN]는 임시 키로 대체
  //    (이건 건드리지 않기 위함)
  // -------------------------------------
  const CORRECT_MARKER = "@@@CORRECT_PLACEHOLDER@@@"; // 임시 마커
  const correctPlaceholders: string[] = [];

  // 임시 교체 (예: #[image3] => "@@@CORRECT_PLACEHOLDER@@@0"
  content = content.replace(/#\[image(\d+)\]/gi, (match, num) => {
    correctPlaceholders.push(match); // 실제 문자열 저장
    return CORRECT_MARKER + (correctPlaceholders.length - 1);
  });

  // -------------------------------------
  // 2) 잘못된 placeholder들만 교정
  //    (#1, [2], [image3], #(4), # (5) 등)
  //    ※ 일반 숫자(예: 2.0, 2024)는 "#", "[" 가 없으니 매칭 안 됨
  // -------------------------------------
  content = content.replace(
    /#\s?\(?(\d+)\)?|\[image(\d+)\]|\[(\d+)\]/gi,
    (_, g1, g2, g3) => {
      const imageNum = g1 || g2 || g3;
      return `#[image${imageNum}]`;
    }
  );

  // -------------------------------------
  // 3) 임시 키로 대체해둔 "정확한" placeholder 복원
  // -------------------------------------
  content = content.replace(new RegExp(CORRECT_MARKER + "(\\d+)", "g"), (_, idx) => {
    return correctPlaceholders[parseInt(idx, 10)];
  });

  // -------------------------------------
  // 4) `#[imageX]` 뒤에 { ... }가 붙어 있으면 제거
  // -------------------------------------
  content = content.replace(
    /(\#\[image\d+\])\s*,?\s*\{.*?\}(,\s*KOREA)?/gi,
    "$1"
  );

  return content;
}
  // =========================================
  // 7) 복사 함수
  // =========================================

  // 7-1) intro + body + conclusion만 복사
  const handleCopyIntroBodyConclusion = async () => {
    const combinedText = [intro, body, conclusion]
      .filter((t) => t.trim().length > 0)
      .join("\n\n");

    try {
      if (!combinedText) {
        alert("⚠️ 복사할 내용이 없습니다.");
        return;
      }
      await navigator.clipboard.writeText(combinedText);
      alert("✅ 본문이 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("❌ 복사 실패:", error);
      alert("❌ 본문 복사 중 오류가 발생했습니다.");
    }
  };

  // 7-2) 텍스트 + 이미지 복사
  const handleCopyUpdatedContentWithImages = async () => {
    try {
      if (!updatedContent) {
        alert("⚠️ 복사할 콘텐츠가 없습니다.");
        return;
      }
      let htmlContent = updatedContent.replace(/\\n/g, "\n");
      htmlContent = htmlContent
        .split("\n")
        .map((line) =>
          line.replace(/# ?\[(\d+)\]/g, (match, number) => {
            const imageObj = imagesById[number];
            return imageObj
              ? `<img src="${imageObj.imageUrl}" alt="Image ${number}" style="max-width: 300px; display: block; margin: 8px 0;" />`
              : match;
          })
        )
        .join("<br>");

      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": htmlBlob });
      await navigator.clipboard.write([clipboardItem]);

      alert("✅ 텍스트와 이미지가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("❌ 복사 실패:", error);
      alert("❌ 텍스트와 이미지 복사 중 오류가 발생했습니다.");
    }
  };

  // =========================
  // [추가] 다운로드 관련 함수
  // =========================

  /**
   * (1) updatedContent를 txt 파일로 다운로드
   */
  const handleDownloadTxt = () => {
    if (!updatedContent) {
      alert("⚠️ 다운로드할 텍스트가 없습니다.");
      return;
    }

    try {
      // 이미 state에 저장된 updatedContent가 후처리된 상태이므로 그대로 사용
      const blob = new Blob([updatedContent], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "content.txt");
    } catch (error) {
      console.error("❌ TXT 다운로드 실패:", error);
      alert("❌ TXT 다운로드 중 오류가 발생했습니다.");
    }
  };

  /**
   * (2) images[]를 zip으로 묶어 다운로드
   *     이미지 파일명: 1.png, 2.png, 3.png ... 순서대로
   */
  const handleDownloadImagesZip = async () => {
    if (!images || images.length === 0) {
      alert("⚠️ 다운로드할 이미지가 없습니다.");
      return;
    }
    try {
      const zip = new JSZip();
      let index = 1;

      for (const img of images) {
        // 이미지 데이터를 직접 fetch -> arrayBuffer
        const response = await fetch(img.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        // zip 객체에 파일 추가
        zip.file(`${index}.png`, arrayBuffer);
        index++;
      }

      // zip Blob 생성
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "images.zip");
    } catch (error) {
      console.error("❌ 이미지 ZIP 다운로드 실패:", error);
      alert("❌ 이미지 ZIP 다운로드 중 오류가 발생했습니다.");
    }
  };

  // =========================================
  // 기존 함수들 (initializeContent 등)
  // =========================================
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
    console.log(message);
  };

  const renderWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const handleInitializeContent = async (): Promise<{
    serviceanalysis: Analysis | null;
    subkeywordlist: string[] | null;
  }> => {
    updateLog("초기화 중...");
    const hasAllPersonaData =
      personaServiceName.trim() && serviceType.trim() && serviceAdvantages.trim();
    const personaData = hasAllPersonaData
      ? {
          service_industry: serviceType,
          service_name: personaServiceName,
          service_advantage: serviceAdvantages,
        }
      : undefined;

    const result = await initializeContent(mainkeyword, personaData);
    if (result.serviceanalysis) {
      setServiceAnalysis(result.serviceanalysis);
    }
    if (
      result.subkeywordlist.relatedTerms &&
      result.subkeywordlist.relatedTerms.length > 0
    ) {
      setSubKeywordlist(result.subkeywordlist.relatedTerms);
    } else if (
      result.subkeywordlist.autocompleteTerms &&
      result.subkeywordlist.autocompleteTerms.length > 0
    ) {
      setSubKeywordlist(result.subkeywordlist.autocompleteTerms);
    } else {
      setSubKeywordlist(null);
    }
    updateLog("콘텐츠 초기화 완료");
    return {
      serviceanalysis: result.serviceanalysis || null,
      subkeywordlist:
        result.subkeywordlist.relatedTerms ||
        result.subkeywordlist.autocompleteTerms ||
        [],
    };
  };

  const handleGenerateToc = async (
    serviceanalysis: Analysis | null,
    currentTitle: string
  ): Promise<string> => {
    updateLog("목차 생성 중...");
    const result = await generateToc(mainkeyword, currentTitle);
    setToc(result.toc);
    updateLog("목차 생성 완료");
    return result.toc;
  };

  const handleGenerateIntro = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string
  ): Promise<string> => {
    updateLog("서론 생성 중...");
    const result = await generateIntro(mainkeyword, currentTitle, currentToc);
    setIntro(result.intro);
    updateLog("서론 생성 완료");
    return result.intro;
  };

  const handleGenerateBody = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string,
    currentIntro: string
  ): Promise<string> => {
    updateLog("본론 생성 중...");
    const result = await generateBody(
      mainkeyword,
      currentTitle,
      currentToc,
      currentIntro
    );
    setBody(result.body);
    updateLog("본론 생성 완료");
    return result.body;
  };

  const handleGenerateConclusion = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string,
    currentIntro: string,
    currentBody: string
  ): Promise<string> => {
    updateLog("결론 생성 중...");
    const result = await generateConclusion(
      mainkeyword,
      currentTitle,
      currentToc,
      currentIntro,
      currentBody
    );
    setConclusion(result.conclusion);
    updateLog("결론 생성 완료");
    return result.conclusion;
  };

  const handleGenerateImagePrompt = async (
    serviceanalysis: Analysis | null,
    currentContent: {
      title: string;
      toc: string[];
      intro: string;
      body: string;
      conclusion: string;
    }
  ): Promise<{
    updatedContent: string;
    imagePrompts: { id: string; prompt: string }[];
  }> => {
    updateLog("이미지 프롬프트 생성 중...");
    const result = await generateImagePrompt(currentContent);
    // ---------- [추가] 후처리 로직 적용 ----------
    let processedContent = "";
    if (result.updatedContent) {
      // 1) 후처리
      processedContent = postProcessUpdatedContent(result.updatedContent);
      // 2) state에 최종 정리된 content 저장
      setUpdatedContent(processedContent);
    }

    setImagePrompts(result.imagePrompts);
    updateLog("이미지 프롬프트 생성 완료");

    return {
      updatedContent: processedContent || "",
      imagePrompts: result.imagePrompts,
    };
  };

  const handleGenerateImages = async (
    imagePromptsData: { id: string; prompt: string }[]
  ): Promise<{ id: string; imageUrl: string }[]> => {
    updateLog("이미지 실제 생성 중...");
    const result = await generateImage(imagePromptsData);

    // 배열 상태
    setImages(result.images);

    // 객체 형태로도 변환해서 보관
    const objMap: Record<string, { id: string; imageUrl: string }> = {};
    result.images.forEach((img) => {
      objMap[img.id] = img;
    });
    setImagesById(objMap);

    updateLog("이미지 생성 완료");
    return result.images;
  };

  const handleSaveFinalResult = async (finalResult: FinalResult) => {
    try {
      updateLog("최종 결과 저장 중...");
      await saveFinalResult(finalResult);
      updateLog("최종 결과 저장 완료");
    } catch (error) {
      updateLog(`최종 결과 저장 오류: ${error}`);
      console.error("최종 결과 저장 오류:", error);
    }
  };

  const handleSaveFeedback = async () => {
    updateLog("피드백 전송 중...");
    const result = await saveFeedback(feedback);
    updateLog("피드백 전송 완료");
    setFeedback("");
  };

  // =========================================
  // 통합 핸들러: 컨텐츠 생성
  // =========================================
  const handleGenerateContent = async () => {
    if (updatedContent) {
      resetAllStates();
    }
    try {
      updateLog("🔄 콘텐츠 생성 시작...");
      setProgress(10);
      setProgressMessage("컨텐츠 초기화 중...");
      const initResult = await handleInitializeContent();

      setProgress(30);
      setProgressMessage("목차 생성 중...");
      const tocResult = await handleGenerateToc(
        initResult.serviceanalysis,
        title
      );
      console.log("title", title);

      setProgress(50);
      setProgressMessage("서론 생성 중...");
      const introResult = await handleGenerateIntro(
        initResult.serviceanalysis,
        title,
        tocResult
      );
      console.log("title", title);
      console.log("tocResult", tocResult);
      setProgress(70);
      setProgressMessage("본론 생성 중...");
      const bodyResult = await handleGenerateBody(
        initResult.serviceanalysis,
        title,
        tocResult,
        introResult
      );

      setProgress(90);
      setProgressMessage("결론 생성 중...");
      const conclusionResult = await handleGenerateConclusion(
        initResult.serviceanalysis,
        title,
        tocResult,
        introResult,
        bodyResult
      );

      updateLog("✅ 콘텐츠 생성 완료!");
      setIsContentGenerated(true);
      setProgress(100);
      setProgressMessage("컨텐츠 생성 완료!");
    } catch (error) {
      updateLog(`❌ 콘텐츠 생성 오류: ${error}`);
      console.error("콘텐츠 생성 오류:", error);
      setProgress(0);
      setProgressMessage("");
    }
  };

  // =========================================
  // 통합 핸들러: 이미지 생성
  // =========================================
  const handleGenerateImagePromptAndImages = async () => {
    try {
      updateLog("이미지 생성 시작...");
      setProgress(10);
      setProgressMessage("이미지 프롬프트 생성 중...");

      const currentContent = {
        title,
        toc: [toc],
        intro,
        body,
        conclusion,
      };
      const imagePromptResult = await handleGenerateImagePrompt(
        serviceAnalysis,
        currentContent
      );

      setProgress(50);
      setProgressMessage("이미지 실제 생성 중...");
      const imagesResult = await handleGenerateImages(
        imagePromptResult.imagePrompts
      );

      setProgress(80);
      setProgressMessage("최종 결과 저장 중...");
      const finalResult: FinalResult = {
        mainKeyword: mainkeyword,
        persona: {
          service_industry: serviceType,
          service_name: personaServiceName,
          service_advantage: serviceAdvantages,
        },
        service_analysis: serviceAnalysis,
        title,
        toc,
        content: {
          intro,
          body,
          conclusion,
        },
        imagePrompts: imagePromptResult.imagePrompts,
        images: imagesResult,
        updatedContent: imagePromptResult.updatedContent || "",
      };
      await handleSaveFinalResult(finalResult);

      setProgress(100);
      setProgressMessage("이미지 생성 완료!");
      updateLog("최종 결과 저장 완료");
    } catch (error) {
      updateLog(`❌ 이미지 생성 오류: ${error}`);
      console.error("이미지 생성 오류:", error);
      setProgress(0);
      setProgressMessage("");
    }
  };

  // =========================================
  // 최종 콘텐츠 렌더링(이미지 치환)
  // =========================================
  const renderUpdatedContent = () => {
    if (!updatedContent) return null;

    const regex = /#\[image\s*(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    const textStyle = { whiteSpace: "pre-wrap", display: "inline" };

    const content = updatedContent.replace(/\\n/g, "\n");
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      const [placeholder, number] = match;
      const index = match.index;

      if (lastIndex < index) {
        parts.push(
          <span key={`text-${lastIndex}`} style={textStyle}>
            {content.substring(lastIndex, index)}
          </span>
        );
      }

      const imageObj = imagesById[number];
      parts.push(
        imageObj ? (
          <img
            key={`image-${number}`}
            src={imageObj.imageUrl}
            alt={`Image ${number}`}
            className="my-4 max-w-xs h-auto rounded-md object-contain"
          />
        ) : (
          <span key={`placeholder-${number}`} style={textStyle}>
            {placeholder}
          </span>
        )
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} style={textStyle}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  // =========================================
  // 드롭다운 상태
  // =========================================
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // =========================
  // 최종 렌더
  // =========================
  const isUpdatedContentExist = !!updatedContent;

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <SidePanel />
        <ResizableHandle />

        {/* 메인 영역 */}
        <ResizablePanel
          defaultSize={85}
          maxSize={85}
          className="p-4 flex flex-col gap-4 overflow-hidden"
        >
          {/* 입력 필드 */}
          <div className="flex gap-4 p-4 items-center rounded-md shadow bg-white">
            <div className="flex-2">
              <h2 className="text-lg font-bold mb-2">키워드 입력</h2>
              <Input
                placeholder="키워드를 입력하세요"
                value={mainkeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
                className="w-52"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2">제목 입력</h2>
              <Input
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* 
              버튼 표시 로직:
              - 아직 컨텐츠 생성 안 됐거나, 최종 콘텐츠(updatedContent)가 존재하면 → "컨텐츠 생성"
              - 그 외(컨텐츠만 생성된 상태, 이미지 아직 생성 안된 상태) → "이미지 생성"
            */}
            {!isContentGenerated || isUpdatedContentExist ? (
              <Button
                onClick={handleGenerateContent}
                disabled={progress > 0 && progress < 100}
                className="mt-auto justify-end"
              >
                📝 컨텐츠 생성
              </Button>
            ) : (
              <Button
                onClick={handleGenerateImagePromptAndImages}
                disabled={progress > 0 && progress < 100}
                className="mt-auto justify-end"
              >
                이미지 생성
              </Button>
            )}
          </div>

          {/* 진행도 표시 */}
          {progress > 0 && (
            <div className="px-4">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )}

          {/* 생성된 텍스트 / 이미지 미리보기 영역 */}
          <div className="flex-1 bg-white rounded-md p-4">
            {/* (1) updatedContent가 없을 때: intro/body/conclusion + "복사하기" 버튼 */}
            {!isUpdatedContentExist && isContentGenerated && (
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <h3 className="font-bold mb-2 flex items-center">
                    📑 생성된 콘텐츠
                    <div className="flex-1" />
                    <Button
                      className="ml-auto"
                      onClick={handleCopyIntroBodyConclusion}
                    >
                      📋 복사하기
                    </Button>
                    {/* ▼ 추가: 다운로드 드롭다운 */}
                    <div className="relative inline-block">
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={toggleDropdown}
                      >
                        다운로드 ▼
                      </Button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                          <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                            onClick={() => {
                              toggleDropdown();
                              // 여기서는 intro+body+conclusion 전체 저장을 할 지,
                              // 아니면 updatedContent가 없는 상태에서는 텍스트 버튼 disable할 지 등
                              // 상황에 맞게 원하는 로직으로 수정 가능
                              // 지금은 updatedContent가 없으므로, combinedText 다운로드 예시
                              const combinedText = [
                                intro,
                                body,
                                conclusion,
                              ]
                                .filter((t) => t.trim().length > 0)
                                .join("\n\n");
                              if (!combinedText) {
                                alert("⚠️ 저장할 내용이 없습니다.");
                                return;
                              }
                              const blob = new Blob([combinedText], {
                                type: "text/plain;charset=utf-8",
                              });
                              saveAs(blob, "content.txt");
                            }}
                          >
                            텍스트(txt)
                          </button>
                          <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                            onClick={() => {
                              toggleDropdown();
                              handleDownloadImagesZip();
                            }}
                          >
                            이미지(zip)
                          </button>
                        </div>
                      )}
                    </div>
                  </h3>
                </div>
                <div className="font-bold whitespace-pre-wrap break-words">
                  📝 키워드: {mainkeyword}
                </div>
                <div className="font-bold whitespace-pre-wrap break-words">
                  🏷️ 제목: {title}
                </div>
                <div className="font-bold whitespace-pre-wrap break-words">
                  📚 목차: {toc}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {renderWithLineBreaks(intro)}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {renderWithLineBreaks(body)}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {renderWithLineBreaks(conclusion)}
                </div>
              </div>
            )}

            {/* (2) 최종 콘텐츠 (updatedContent) 렌더링 + "텍스트+이미지 복사" 버튼 */}
            {isUpdatedContentExist && (
              <div className="whitespace-pre-wrap break-words mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">최종 콘텐츠:</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopyUpdatedContentWithImages}>
                      📋 복사하기
                    </Button>
                    {/* ▼ 추가: 다운로드 드롭다운 */}
                    <div className="relative inline-block">
                      <Button variant="outline" onClick={toggleDropdown}>
                        다운로드 ▼
                      </Button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                          <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                            onClick={() => {
                              toggleDropdown();
                              handleDownloadTxt();
                            }}
                          >
                            텍스트(txt)
                          </button>
                          <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                            onClick={() => {
                              toggleDropdown();
                              handleDownloadImagesZip();
                            }}
                          >
                            이미지(zip)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {renderUpdatedContent()}
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
