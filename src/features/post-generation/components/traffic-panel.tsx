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

// Import your server actions
import { initializeContent } from "@/features/post-generation/actions/others/initialize_content";
import { generateToc } from "@/features/post-generation/actions/content/generate_toc";
import { generateIntro } from "@/features/post-generation/actions/content/generate_intro";
import { generateBody } from "@/features/post-generation/actions/content/generate_body";
import { generateConclusion } from "@/features/post-generation/actions/content/generate_conclusion";
import { generateImagePrompt } from "@/features/post-generation/actions/image/generate_imagePrompt";
import { generateImage } from "@/features/post-generation/actions/image/generate_image";
import { saveFinalResult } from "../actions/others/save_finalResult";
import { Analysis, FinalResult } from "../types";
import { Textarea } from "@/components/ui/textarea";
import { saveFeedback } from "../actions/others/saveFeedback";

/* ==========================
   1) 진행도 표시 컴포넌트
   ========================== */
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
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
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
  // 0) 전체 state 리셋 함수 (이미 존재)
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
    setProgress(0);
    setProgressMessage("");
    setIsContentGenerated(false);
  }

  // =========================================
  // 7) 복사 함수 추가/수정
  // =========================================

  // 7-1) intro + body + conclusion만 복사하는 함수
  const handleCopyIntroBodyConclusion = async () => {
    // intro, body, conclusion 문자열 합침
    const combinedText = [intro, body, conclusion]
      .filter((t) => t.trim().length > 0) // 빈 문자열 제거
      .join("\n\n");

    try {
      if (!combinedText) {
        alert("⚠️ 복사할 내용이 없습니다.");
        return;
      }
      await navigator.clipboard.writeText(combinedText);
      alert("✅ 본문(서론, 본론, 결론)이 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("❌ 복사 실패:", error);
      alert("❌ 본문 복사 중 오류가 발생했습니다.");
    }
  };

  // 7-2) 텍스트 + 이미지 복사(기존 로직 유지)
  const handleCopyUpdatedContentWithImages = async () => {
    try {
      if (!updatedContent) {
        alert("⚠️ 복사할 콘텐츠가 없습니다.");
        return;
      }

      // 텍스트를 HTML로 변환 (줄바꿈 -> <br>)
      let htmlContent = updatedContent.replace(/\\n/g, "\n");
      htmlContent = htmlContent
        .split("\n")
        .map((line) => {
          // 이미지 플레이스홀더 처리
          return line.replace(/# ?\[(\d+)\]/g, (match, number) => {
            const image = images[number - 1];
            return image
              ? `<img src="${image.imageUrl}" alt="Image ${number}" style="max-width: 300px; display: block; margin: 8px 0;" />`
              : match; // 이미지 없으면 그대로 둠
          });
        })
        .join("<br>"); // 모든 줄을 다시 <br>로 결합

      // HTML 포맷으로 클립보드에 복사
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": htmlBlob });

      await navigator.clipboard.write([clipboardItem]);

      alert("✅ 텍스트와 이미지가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("❌ 복사 실패:", error);
      alert("❌ 텍스트와 이미지 복사 중 오류가 발생했습니다.");
    }
  };

  // ============= 기존 함수들 그대로 유지 (initializeContent, etc)
  // --------------------------------------------------------------------------

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
    if (result.updatedContent) {
      setUpdatedContent(result.updatedContent);
    }
    setImagePrompts(result.imagePrompts);
    updateLog("이미지 프롬프트 생성 완료");
    return {
      updatedContent: result.updatedContent || "",
      imagePrompts: result.imagePrompts,
    };
  };

  const handleGenerateImages = async (
    imagePromptsData: { id: string; prompt: string }[]
  ): Promise<{ id: string; imageUrl: string }[]> => {
    updateLog("이미지 실제 생성 중...");
    const result = await generateImage(imagePromptsData);
    setImages(result.images);
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


  // ========== 통합 핸들러: 컨텐츠 생성 ==========
  const handleGenerateContent = async () => {
    // 만약 기존 updatedContent가 있다면, resetAllStates() 먼저
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
      const tocResult = await handleGenerateToc(initResult.serviceanalysis, title);

      setProgress(50);
      setProgressMessage("서론 생성 중...");
      const introResult = await handleGenerateIntro(
        initResult.serviceanalysis,
        title,
        tocResult
      );

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

  // ========== 통합 핸들러: 이미지 생성 ==========
  const handleGenerateImagePromptAndImages = async () => {
    try {
      updateLog("이미지 생성 시작...");
      setProgress(10);
      setProgressMessage("이미지 프롬프트 생성 중...");

      const currentContent = {
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
      const imagesResult = await handleGenerateImages(imagePromptResult.imagePrompts);

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

  // ========== 최종 콘텐츠 렌더링(이미지 치환) ==========
  const renderUpdatedContent = () => {
    if (!updatedContent) return null;

    const regex = /# ?\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // \n을 실제 줄바꿈
    const content = updatedContent.replace(/\\n/g, "\n");

    while ((match = regex.exec(content)) !== null) {
      const index = match.index;
      const number = parseInt(match[1], 10);

      // 플레이스홀더 이전 텍스트
      if (lastIndex < index) {
        const text = content.substring(lastIndex, index);
        parts.push(
          <span
            key={`text-${lastIndex}`}
            style={{ whiteSpace: "pre-wrap", display: "inline" }}
          >
            {text}
          </span>
        );
      }

      // 이미지 매핑
      const image = images[number - 1];
      if (image) {
        parts.push(
          <img
            key={`image-${number}`}
            src={image.imageUrl}
            alt={`Image ${number}`}
            className="my-4 max-w-xs h-auto rounded-md object-contain"
          />
        );
      } else {
        // 이미지가 없으면 그대로 표시
        parts.push(
          <span
            key={`placeholder-${number}`}
            style={{ whiteSpace: "pre-wrap", display: "inline" }}
          >
            {match[0]}
          </span>
        );
      }
      lastIndex = regex.lastIndex;
    }

    // 마지막 남은 텍스트
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex);
      parts.push(
        <span
          key={`text-${lastIndex}`}
          style={{ whiteSpace: "pre-wrap", display: "inline" }}
        >
          {text}
        </span>
      );
    }

    return parts;
  };

  // =========================
  // 최종 렌더
  // =========================
  const isUpdatedContentExist = !!updatedContent;

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <ResizablePanel
          defaultSize={15}  // Increased from 20 to 25
          minSize={10}      // Increased from 10 to 15
          maxSize={15}
          className="bg-gray-100 p-2 overflow-y-auto"
        >
          <ul className="space-y-1">
            <li>
              <a
                href="/keyword"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                키워드 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/title"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                제목 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/traffic"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                정보성글 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/feedback"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                피드백
              </a>
            </li>
          </ul>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* 메인 영역 */}
        <ResizablePanel
          defaultSize={80}
          minSize={70}
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
              - 아직 컨텐츠 생성 안 됐거나, 최종 콘텐츠(updatedContent)가 존재한다면 → "컨텐츠 생성"
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

          {/* 진행도 표시 (progress > 0 일 때만) */}
          {progress > 0 && (
            <div className="px-4">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )}

          {/* 생성된 텍스트 / 이미지 미리보기 영역 */}
          <div className="flex-1 bg-white rounded-md shadow-md border border-gray-300 overflow-y-auto overflow-x-hidden p-4">
            {/* 
              (1) 아직 updatedContent가 없으면 → intro,body,conclusion 표시
                  + "복사하기" 버튼(본문 텍스트만)
              (2) updatedContent가 있으면 → 최종 콘텐츠 렌더링 + "텍스트 + 이미지 복사" 버튼 
            */}
            {/* (1) intro/body/conclusion 표시 + 복사하기 버튼 */}
            {!isUpdatedContentExist && isContentGenerated && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
                <h3 className="font-bold mb-2 flex items-center">
                  📑 생성된 콘텐츠
                  <div className="flex-1"></div>
                  <Button 
                    className="ml-auto"
                    onClick={handleCopyIntroBodyConclusion}
                  >
                    📋 복사하기
                  </Button>
                </h3>
                  </div>
                <div className="font-bold whitespace-pre-wrap break-words">
                  📝 키워드: {mainkeyword}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  🏷️ 제목: {title}
                </div>
                <div className="whitespace-pre-wrap break-words">
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

                {/* "복사하기" 버튼 (intro+body+conclusion) */}
                </div>
            )}

            {/* (2) 최종 콘텐츠 (updatedContent) 렌더링 + 텍스트+이미지 복사 버튼 */}
            {isUpdatedContentExist && (
              <div className="whitespace-pre-wrap break-words mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">최종 콘텐츠:</span>
                  <Button onClick={handleCopyUpdatedContentWithImages} className="ml-2">
                  📋 복사하기
                  </Button>
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
