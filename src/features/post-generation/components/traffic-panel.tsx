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
  // progress가 0~100 범위를 벗어나지 않도록 가드
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="mt-3 mb-2 w-full">
      {/* 진행 중(1~99) */}
      {progress > 0 && progress < 100 && (
        <p className="text-sm text-gray-700 mb-1 font-medium">
          {message} ({clampedProgress}%)
        </p>
      )}
      {/* 완료(100) */}
      {progress === 100 && (
        <p className="text-sm text-green-600 mb-1 font-medium">
          완료되었습니다!
        </p>
      )}
      {/* 실제 게이지 바 (배경 gray, 진행도 blue) */}
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
  const [progress, setProgress] = useState(0);          // 0 ~ 100
  const [progressMessage, setProgressMessage] = useState(""); // 현재 단계 메시지

  // ===================
  // 5) 생성 완료 여부
  // ===================
  const [isContentGenerated, setIsContentGenerated] = useState(false);

  // ===================
  // 6) 함수들
  // ===================
  // 편의상 기존 함수들 그대로 (initialize, toc, intro.. 등)  
  // --------------------------------------------------

  // 로그 추가
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  // 줄바꿈 처리
  const renderWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // ========== 개별 단계 ==========
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
    const result = await generateBody(mainkeyword, currentTitle, currentToc, currentIntro);
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

  const handleSaveFeedback = async () => {
    updateLog("피드백 전송 중...");
    const result = await saveFeedback(feedback);
    updateLog("피드백 전송 완료");
    setFeedback("");
  };

  // ========== 통합 핸들러: 컨텐츠 생성 ==========
  const handleGenerateContent = async () => {
    try {
      updateLog("🔄 콘텐츠 생성 시작...");
      setProgress(10);
      setProgressMessage("컨텐츠 초기화 중...");
      const initResult = await handleInitializeContent();

      // 목차
      setProgress(30);
      setProgressMessage("목차 생성 중...");
      const tocResult = await handleGenerateToc(initResult.serviceanalysis, title);

      // 서론
      setProgress(50);
      setProgressMessage("서론 생성 중...");
      const introResult = await handleGenerateIntro(initResult.serviceanalysis, title, tocResult);

      // 본론
      setProgress(70);
      setProgressMessage("본론 생성 중...");
      const bodyResult = await handleGenerateBody(
        initResult.serviceanalysis,
        title,
        tocResult,
        introResult
      );

      // 결론
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
      // 실패 시 진행도 0으로 되돌릴 수도 있음
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
        content: {
          title,
          toc: [toc],
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
      // 실패 시 진행도 0으로 되돌릴 수도 있음
      setProgress(0);
      setProgressMessage("");
    }
  };

  // ========== 최종 콘텐츠 렌더링 (이미지 치환) ==========
  const renderUpdatedContent = () => {
    if (!updatedContent) return null;

    // #[숫자], # [숫자] 모두 매칭
    const regex = /# ?\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // 이스케이프된 \n을 실제 줄바꿈으로 변환
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

      // 해당 번호의 이미지 가져오기
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
        // 이미지가 없으면 플레이스홀더 그대로 출력
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

    // 마지막 남은 텍스트 추가
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
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={25}
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

        {/* 리사이저 핸들 */}
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
            {/* 컨텐츠 생성 버튼 */}
            {!isContentGenerated && (
              <Button
                onClick={handleGenerateContent}
                // 진행중(progress > 0 && < 100) 이면 비활성화
                disabled={progress > 0 && progress < 100}
                className="mt-auto justify-end"
              >
                📝 컨텐츠 생성
              </Button>
            )}
            {/* 이미지 생성 버튼 (컨텐츠 생성 완료 후에만 노출) */}
            {isContentGenerated && (
              <Button
                onClick={handleGenerateImagePromptAndImages}
                // 이미 진행중이면 비활성화
                disabled={progress > 0 && progress < 100}
                className="mt-auto justify-end"
              >
                이미지 생성
              </Button>
            )}
          </div>

          {/* 진행도 표시 (progress > 0 일 때 표시) */}
          {progress > 0 && (
            <div className="px-4">
              <ProgressBar progress={progress} message={progressMessage} />
            </div>
          )}

          {/* 생성된 텍스트 / 이미지 미리보기 영역 */}
          <div className="flex-1 bg-white rounded-md shadow-md border border-gray-300 overflow-y-auto overflow-x-hidden p-4">
            <h3 className="font-bold mb-2">📑 생성된 콘텐츠</h3>
            <div className="space-y-2 text-sm">
              <div className="whitespace-pre-wrap break-words">
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
              <div className="whitespace-pre-wrap break-words">
                <span className="font-bold">최종 콘텐츠:</span>{" "}
                {renderUpdatedContent()}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
