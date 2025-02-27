"use client";

import { useState, useEffect, useRef } from "react";
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
import { Analysis, FinalResult, ToneType } from "../types";
import { saveFeedback } from "../actions/others/saveFeedback";
import { SidePanel } from "./side-panel";
import { set } from "date-fns";

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

  // [추가] 말투 상태
  const [tone, setTone] = useState<"정중체" | "음슴체">("음슴체");

  // [추가] 말투 드롭다운 상태
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const toneDropdownRef = useRef<HTMLDivElement>(null);

  // ===================
  // 2) 결과 상태
  // ===================

  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);

  // (1) intro, body, conclusion을 빈 문자열로 초기화
  const [title, setTitle] = useState("");
  const [toc, setToc] = useState("");
  const [intro, setIntro] = useState("");       // 빈 문자열 초기값
  const [body, setBody] = useState("");         // 빈 문자열 초기값
  const [conclusion, setConclusion] = useState(""); // 빈 문자열 초기값

  const [updatedContent, setUpdatedContent] = useState("");
  const [imagePrompts, setImagePrompts] = useState<{ id: string; prompt: string }[]>([]);

  // 이미지 배열 + 이미지 객체 형태(유연한 방법)
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [imagesById, setImagesById] = useState<Record<string, { id: string; imageUrl: string }>>(
    {}
  );

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
    setTone("음슴체"); // 말투 초기화
  }

  // =========================================
  // [추가] 후처리 함수
  // =========================================
  function postProcessUpdatedContent(rawContent: string): string {
    let content = rawContent;
  
    // -------------------------------------
    // 1) "정확한" 형태인 #[imageN]는 임시 키로 대체
    // -------------------------------------
    const CORRECT_MARKER = "@@@CORRECT_PLACEHOLDER@@@"; // 임시 마커
    const correctPlaceholders: string[] = [];
    content = content.replace(/#\[image(\d+)\]/gi, (match) => {
      correctPlaceholders.push(match);
      return CORRECT_MARKER + (correctPlaceholders.length - 1);
    });
  
    // -------------------------------------
    // 2) 잘못된 placeholder들 교정
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
    content = content.replace(/(\#\[image\d+\])\s*,?\s*\{.*?\}(,\s*KOREA)?/gi, "$1");
  
    // -------------------------------------
    // 5) 링크 텍스트 제거
    //    - http:// 또는 https:// 로 시작하는 링크
    //    - www. 로 시작하는 링크
    //    - 도메인 형식 (예: example.co, test.kr, sample.i, demo.a 등)
    // -------------------------------------
    content = content.replace(
      /(?:https?:\/\/|www\.)\S+|\b(?:[a-zA-Z0-9-]+\.)+(?:co|kr|i|a)\b(?:\/\S*)?/gi,
      ''
    );
  
    return content;
  }
  
  
  // =========================================
  // 7) 복사 함수
  // =========================================

  const handleCopyIntroBodyConclusion = async () => {
    const combinedText = [intro, body, conclusion].filter((t) => t.trim().length > 0).join("\n\n");
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

  const handleCopyUpdatedContentWithImages = async () => {
    try {
      if (!updatedContent) {
        alert("⚠️ 복사할 콘텐츠가 없습니다.");
        return;
      }
  
      let plainTextContent = updatedContent.replace(/\\n/g, "\n");
      plainTextContent = plainTextContent
        .split("\n")
        .map((line) =>
          line.replace(/# ?\[(\d+)\]/g, (match, number) => {
            const imageObj = imagesById[number];
            return imageObj ? `[이미지 ${number} 포함]` : match;
          })
        )
        .join("\n"); // HTML 대신 개행 문자 유지
  
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
  
      const textBlob = new Blob([plainTextContent], { type: "text/plain" });
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
  
      const clipboardItem = new ClipboardItem({
        "text/plain": textBlob, // 일반 텍스트 복사 (메모장에서 붙여넣기 가능)
        "text/html": htmlBlob,  // HTML 복사 (웹에서 붙여넣기 가능)
      });
  
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

  const handleDownloadTxt = () => {
    if (!updatedContent) {
      alert("⚠️ 다운로드할 텍스트가 없습니다.");
      return;
    }

    try {
      const blob = new Blob([updatedContent], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "content.txt");
    } catch (error) {
      console.error("❌ TXT 다운로드 실패:", error);
      alert("❌ TXT 다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleDownloadImagesZip = async () => {
    if (!images || images.length === 0) {
      alert("⚠️ 다운로드할 이미지가 없습니다.");
      return;
    }
    try {
      const zip = new JSZip();
      let index = 1;
      for (const img of images) {
        const response = await fetch(img.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        zip.file(`${index}.png`, arrayBuffer);
        index++;
      }
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
    setDebugLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  // (2) renderWithLineBreaks에 기본값 설정
  const renderWithLineBreaks = (text: string = "") => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const handleInitializeContent = async (): Promise<{
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

    const result = await initializeContent(mainkeyword);
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
      subkeywordlist:
        result.subkeywordlist.relatedTerms || result.subkeywordlist.autocompleteTerms || [],
    };
  };

  const handleGenerateToc = async (
    mainkeyword: string,
    title: string,
    tone: ToneType,
  ): Promise<string> => {
    updateLog("목차 생성 중...");
    const result = await generateToc(mainkeyword, title, tone || undefined);
    setToc(result.toc);
    updateLog("목차 생성 완료");
    return result.toc;
  };

  const handleGenerateIntro = async (
    mainkeyword: string,
    title: string,
    toc: string,
    tone: ToneType,
  ): Promise<string> => {
    updateLog("서론 생성 중...");
    const result = await generateIntro(mainkeyword, title, toc, tone);
    setIntro(result.intro);
    updateLog("서론 생성 완료");
    return result.intro;
  };

  const handleGenerateBody = async (
    mainkeyword: string,
    title: string,
    toc: string,
    intro: string,
    tone: ToneType,
  ): Promise<string> => {
    updateLog("본론 생성 중...");
    const result = await generateBody(
      mainkeyword,
      title,
      toc,
      intro,
      tone
    );
    setBody(result.body);
    updateLog("본론 생성 완료");
    return result.body;
  };

  const handleGenerateConclusion = async (
    mainkeyword: string,
    title: string,
    toc: string,
    intro: string,
    body: string,
    tone: ToneType,
  ): Promise<string> => {
    updateLog("결론 생성 중...");
    const result = await generateConclusion(
      mainkeyword,
      title,
      toc,
      intro,
      body,
      tone
    );
    setConclusion(result.conclusion);
    updateLog("결론 생성 완료");
    return result.conclusion;
  };

  const handleGenerateImagePrompt = async (
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
    let processedContent = "";
    if (result.updatedContent) {
      processedContent = postProcessUpdatedContent(result.updatedContent);
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
    setImages(result.images);

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

  // 통합 핸들러: 컨텐츠 생성
  const handleGenerateContent = async () => {
    if (!tone) {
      alert("⚠️ 말투를 선택해주세요.");
      return;
    }

    if (updatedContent) {
      resetAllStates();
    }
    try {
      updateLog("🔄 콘텐츠 생성 시작...");
      setProgress(10);
      // setProgressMessage("컨텐츠 초기화 중...");
      // const initResult = await handleInitializeContent();

      setProgress(30);
      setProgressMessage("목차 생성 중...");
      const tocResult = await handleGenerateToc(
        mainkeyword,
        title,
        tone,                      // tone 전달
      );
      setToc(tocResult);

      setProgress(50);
      setProgressMessage("서론 생성 중...");
      const introResult = await handleGenerateIntro(
        mainkeyword,
        title,
        tocResult,
        tone,                      // tone 전달
      );
      setIntro(introResult);

      setProgress(70);
      setProgressMessage("본론 생성 중...");
      const bodyResult = await handleGenerateBody(
        mainkeyword,
        title,
        tocResult,
        introResult,
        tone,                      // tone 전달
      );
      setBody(bodyResult);

      setProgress(90);
      setProgressMessage("결론 생성 중...");
      const conclusionResult = await handleGenerateConclusion(
        mainkeyword,
        title,
        tocResult,
        introResult,
        bodyResult,
        tone,                      // tone 전달
      );
      setConclusion(conclusionResult);

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

  // 통합 핸들러: 이미지 생성
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
        currentContent
      );

      setProgress(50);
      setProgressMessage("이미지 실제 생성 중...");
      const imagesResult = await handleGenerateImages(imagePromptResult.imagePrompts);

      setProgress(80);
      setProgressMessage("최종 결과 저장 중...");
      const finalResult: FinalResult = {
        mainKeyword: mainkeyword,
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
      // 이미지 생성 완료 후 다시 "컨텐츠 생성" 버튼으로 전환
      setIsContentGenerated(false);
    } catch (error) {
      updateLog(`❌ 이미지 생성 오류: ${error}`);
      console.error("이미지 생성 오류:", error);
      setProgress(0);
      setProgressMessage("");
    }
  };

  // 최종 콘텐츠 렌더링(이미지 치환)
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

  // 드롭다운 상태 (다운로드와 말투 드롭다운 각각 관리)
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  const toggleDownloadDropdown = () => {
    setIsDownloadDropdownOpen(!isDownloadDropdownOpen);
  };

  const toggleToneDropdown = () => {
    setIsToneDropdownOpen(!isToneDropdownOpen);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toneDropdownRef.current &&
        !toneDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToneDropdownOpen(false);
      }
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDownloadDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isUpdatedContentExist = !!updatedContent;

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <SidePanel />
        <ResizableHandle />

        <ResizablePanel defaultSize={85} maxSize={85} className="p-4 flex flex-col gap-4 overflow-hidden">
          {/* 입력 필드 */}
          <div className="flex flex-col gap-4 p-4 rounded-md shadow bg-white">
            <div className="flex gap-4">
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
            </div>

            {/* 말투 선택 드롭다운과 버튼 */}
            <div className="flex items-end gap-4">
              <div className="w-32 relative" ref={toneDropdownRef}>
                <Button
                  variant="outline"
                  onClick={toggleToneDropdown}
                  className="w-full flex justify-between items-center"
                >
                  {tone ? tone : "말투 선택"}
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      isToneDropdownOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </Button>
                {isToneDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setTone("음슴체");
                        setIsToneDropdownOpen(false);
                      }}
                    >
                      음슴체
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setTone("정중체");
                        setIsToneDropdownOpen(false);
                      }}
                    >
                      정중체
                    </button>
                  </div>
                )}
              </div>

              {!isContentGenerated ? (
                <Button
                  onClick={handleGenerateContent}
                  disabled={(progress > 0 && progress < 100) || !tone}
                  className="mt-0"
                >
                  📝 컨텐츠 생성
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateImagePromptAndImages}
                  disabled={progress > 0 && progress < 100}
                  className="mt-0"
                >
                  🖼️ 이미지 생성
                </Button>
              )}
            </div>
          </div>

          {progress > 0 && (
            <div className="px-4">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )}

          <div className="flex-1 bg-white rounded-md p-4">
            {/* (1) updatedContent가 없을 때: intro/body/conclusion + "복사하기" 버튼 */}
            {!isUpdatedContentExist && isContentGenerated && (
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <h3 className="font-bold mb-2 flex items-center">
                    📑 생성된 콘텐츠
                    <div className="flex-1" />
                    <Button className="ml-auto" onClick={handleCopyIntroBodyConclusion}>
                      📋 복사하기
                    </Button>
                    <div className="relative inline-block ml-2" ref={downloadDropdownRef}>
                      <Button variant="outline" onClick={toggleDownloadDropdown} className="flex items-center">
                        다운로드 ▼
                      </Button>
                      {isDownloadDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              toggleDownloadDropdown();
                              const combinedText = [intro, body, conclusion]
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
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              toggleDownloadDropdown();
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
                <div className="font-bold whitespace-pre-wrap break-words">📝 키워드: {mainkeyword}</div>
                <div className="font-bold whitespace-pre-wrap break-words">🏷️ 제목: {title}</div>
                <div className="font-bold whitespace-pre-wrap break-words">📚 목차: {toc}</div>
                <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(intro)}</div>
                <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(body)}</div>
                <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(conclusion)}</div>
              </div>
            )}

            {/* (2) 최종 콘텐츠 (updatedContent) 렌더링 + "텍스트+이미지 복사" 버튼 */}
            {isUpdatedContentExist && (
              <div className="whitespace-pre-wrap break-words mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">최종 콘텐츠:</span>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopyUpdatedContentWithImages}>📋 복사하기</Button>
                    <div className="relative inline-block" ref={downloadDropdownRef}>
                      <Button variant="outline" onClick={toggleDownloadDropdown} className="flex items-center">
                        다운로드 ▼
                      </Button>
                      {isDownloadDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              toggleDownloadDropdown();
                              handleDownloadTxt();
                            }}
                          >
                            텍스트(txt)
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              toggleDownloadDropdown();
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
