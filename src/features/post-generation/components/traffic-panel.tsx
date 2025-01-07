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

export function TrafficPanel() {
  // Input states
  const [mainkeyword, setMainKeyword] = useState("");
  const [personaServiceName, setPersonaServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceAdvantages, setServiceAdvantages] = useState("");

  // Result states
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
  const [imagePrompts, setImagePrompts] = useState<{ id: string; prompt: string }[]>([]);
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [feedback, setFeedback] = useState("");

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const persona = {
    service_industry: serviceType,
    service_name: personaServiceName,
    service_advantage: serviceAdvantages,
  };

  const content = {
    title,
    toc: [toc],
    intro,
    body,
    conclusion,
  };

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  // Individual step execution handlers
  const handleInitializeContent = async (): Promise<{
    serviceanalysis: Analysis | null;
    subkeywordlist: string[] | null;
  }> => {
    updateLog("초기화 중...");
    const hasAllPersonaData =
      personaServiceName.trim() && serviceType.trim() && serviceAdvantages.trim();
    const personaData = hasAllPersonaData ? persona : undefined; // Ensure it's undefined instead of null
    const result = await initializeContent(mainkeyword, personaData);
    if (result.serviceanalysis) {
      setServiceAnalysis(result.serviceanalysis);
    }
    if (result.subkeywordlist.relatedTerms && result.subkeywordlist.relatedTerms.length > 0) {
      setSubKeywordlist(result.subkeywordlist.relatedTerms);
    } else if (result.subkeywordlist.autocompleteTerms && result.subkeywordlist.autocompleteTerms.length > 0) {
      setSubKeywordlist(result.subkeywordlist.autocompleteTerms);
    } else {
      setSubKeywordlist(null);
    }
    updateLog(`콘텐츠 초기화됨`);
    return {
      serviceanalysis: result.serviceanalysis || null,
      subkeywordlist: result.subkeywordlist.relatedTerms || result.subkeywordlist.autocompleteTerms || [],
    };
  };

  const handleGenerateToc = async (
    serviceanalysis: Analysis | null,
    currentTitle: string
  ): Promise<string> => {
    updateLog("목차 생성 중...");
    const result = await generateToc(mainkeyword, currentTitle);
    setToc(result.toc);
    updateLog(`목차 생성됨`);
    return result.toc;
  };

  const handleGenerateIntro = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string
  ): Promise<string> => {
    const result = await generateIntro(mainkeyword, currentTitle, currentToc);
    setIntro(result.intro);
    return result.intro;
  };

  const handleGenerateBody = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string,
    currentIntro: string
  ): Promise<string> => {
    const result = await generateBody(mainkeyword, currentTitle, currentToc, currentIntro);
    setBody(result.body);
    return result.body;
  };

  const handleGenerateConclusion = async (
    serviceanalysis: Analysis | null,
    currentTitle: string,
    currentToc: string,
    currentIntro: string,
    currentBody: string
  ): Promise<string> => {
    const result = await generateConclusion(
      mainkeyword,
      currentTitle,
      currentToc,
      currentIntro,
      currentBody,
    );
    setConclusion(result.conclusion);
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
    const result = await generateImagePrompt(currentContent);
    if (result.updatedContent) {
      setUpdatedContent(result.updatedContent);
    }
    setImagePrompts(result.imagePrompts);
    return {
      updatedContent: result.updatedContent || "",
      imagePrompts: result.imagePrompts,
    };
  };

  const handleGenerateImages = async (
    imagePromptsData: { id: string; prompt: string }[]
  ): Promise<{ id: string; imageUrl: string }[]> => {
    updateLog("이미지 생성 중...");
    const result = await generateImage(imagePromptsData);
    setImages(result.images);
    return result.images;
  };

  const handleSaveFinalResult = async (finalResult: FinalResult) => {
    try {
      updateLog("최종 결과 저장 중...");
      const result = await saveFinalResult(finalResult);
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
  // 새로운 통합 핸들러 함수들
  // 1a. 초기화 및 TOC 생성
  const handleInitializeAndGenerateToc = async () => {
    try {
      updateLog("초기화 및 목차 생성 시작...");
      const initResult = await handleInitializeContent();
      const tocResult = await handleGenerateToc(initResult.serviceanalysis, title);
      setToc(tocResult);
      updateLog("초기화 및 목차 생성 완료");
      // No need to return, states are already set
    } catch (error) {
      updateLog(`초기화 및 목차 생성 오류: ${error}`);
      console.error("초기화 및 목차 생성 오류:", error);
    }
  };

  // 1b. 서론, 본문, 결론 생성
  const handleGenerateIntroductionBodyConclusion = async () => {
    try {
      updateLog("컨텐츠 생성 시작...");
      const introResult = await handleGenerateIntro(serviceAnalysis, title, toc);
      setIntro(introResult);
      const bodyResult = await handleGenerateBody(serviceAnalysis, title, toc, introResult);
      setBody(bodyResult);
      const conclusionResult = await handleGenerateConclusion(serviceAnalysis, title, toc, introResult, bodyResult);
      setConclusion(conclusionResult);
      updateLog("컨텐츠 생성 완료");
      // No need to return, states are already set
    } catch (error) {
      updateLog(`컨텐츠 생성 오류: ${error}`);
      console.error("컨텐츠 생성 오류:", error);
    }
  };

  // 1c. 이미지 프롬프트 및 이미지 생성 + 최종 결과 저장
  const handleGenerateImagePromptAndImages = async () => {
    try {
      updateLog("이미지 생성 시작...");
      const currentContent = {
        title,
        toc: [toc],
        intro,
        body,
        conclusion,
      };
      const imagePromptResult = await handleGenerateImagePrompt(serviceAnalysis, currentContent);
      const imagesResult = await handleGenerateImages(imagePromptResult.imagePrompts);
      updateLog("이미지 생성 완료");
      // No need to return, states are already set
      updateLog("최종 결과 저장 중...");
      const finalResult: FinalResult = {
        mainKeyword: mainkeyword,
        persona,
        service_analysis: serviceAnalysis,
        content,
        imagePrompts: imagePromptResult.imagePrompts,
        images: imagesResult,
        updatedContent: imagePromptResult.updatedContent || "",
      };
      const result = await saveFinalResult(finalResult);
      updateLog("최종 결과 저장 완료");
    } catch (error) {
      updateLog(`최종 결과 저장 오류: ${error}`);
      console.error("최종 결과 저장 오류:", error);
    }
  };

    // 📌 통합 핸들러: 초기화 + TOC + 서론, 본론, 결론 생성
    const handleGenerateContent = async () => {
      try {
        updateLog("🔄 콘텐츠 생성 시작...");
  
        // Step 1: 초기화 및 TOC 생성
        updateLog("1️⃣ 초기화 및 목차 생성 중...");
        const initResult = await initializeContent(mainkeyword);
        const tocResult = await generateToc(mainkeyword, title, initResult.serviceanalysis, );
        setToc(tocResult.toc);
        updateLog("✅ 초기화 및 목차 생성 완료!");
  
        // Step 2: 서론, 본론, 결론 생성
        updateLog("2️⃣ 서론 생성 중...");
        const introResult = await generateIntro(mainkeyword, title, tocResult.toc, initResult.serviceanalysis);
        setIntro(introResult.intro);
  
        updateLog("3️⃣ 본론 생성 중...");
        const bodyResult = await generateBody(mainkeyword, title, tocResult.toc, introResult.intro,initResult.serviceanalysis);  
        setBody(bodyResult.body);
  
        updateLog("4️⃣ 결론 생성 중...");
        const conclusionResult = await generateConclusion(mainkeyword, title, tocResult.toc, introResult.intro, bodyResult.body,initResult.serviceanalysis);
        setConclusion(conclusionResult.conclusion);
  
        updateLog("✅ 콘텐츠 생성 완료!");
      } catch (error) {
        updateLog(`❌ 콘텐츠 생성 오류: ${error}`);
        console.error("콘텐츠 생성 오류:", error);
      }
    };
  

  // 기존의 모든 단계를 순차적으로 실행하는 핸들러
  const handleRunAll = async () => {
    updateLog("모든 단계 실행 시작...");

    try {
      // 초기화 및 TOC 생성
      updateLog("초기화 및 목차 생성...");
      const initResult = await handleInitializeContent();
      const tocResult = await handleGenerateToc(initResult.serviceanalysis, title);

      // 서론, 본문, 결론 생성
      updateLog("컨텐츠 생성...");
      const introResult = await handleGenerateIntro(initResult.serviceanalysis, title, tocResult);
      const bodyResult = await handleGenerateBody(initResult.serviceanalysis, title, tocResult, introResult);
      const conclusionResult = await handleGenerateConclusion(initResult.serviceanalysis, title, tocResult, introResult, bodyResult);

      // 이미지 프롬프트 및 이미지 생성
      updateLog("이미지 생성...");
      const currentContent = {
        title: title,
        toc: [tocResult],
        intro: introResult,
        body: bodyResult,
        conclusion: conclusionResult,
      };
      const imagePromptResult = await handleGenerateImagePrompt(initResult.serviceanalysis, currentContent);
      const imagesResult = await handleGenerateImages(imagePromptResult.imagePrompts);

      // 최종 결과 저장
      updateLog("최종 결과 저장...");
      const finalResult: FinalResult = {
        mainKeyword: mainkeyword,
        persona,
        service_analysis: initResult.serviceanalysis || {
          industry_analysis: null,
          advantage_analysis: null,
          target_needs: null,
        },
        content: {
          title: title,
          toc: [tocResult],
          intro: introResult,
          body: bodyResult,
          conclusion: conclusionResult,
        },
        imagePrompts: imagePromptResult.imagePrompts,
        images: imagesResult,
        updatedContent: imagePromptResult.updatedContent || "",
      };
      await handleSaveFinalResult(finalResult);

      updateLog("모든 단계 실행 완료.");
      console.log("모든 단계 실행 완료.");
    } catch (error) {
      updateLog(`모든 단계 실행 오류: ${error}`);
      console.error("모든 단계 실행 오류:", error);
    }
  };

  // 상태 초기화 핸들러
  const handleResetStates = () => {
    setMainKeyword("");
    setPersonaServiceName("");
    setServiceType("");
    setServiceAdvantages("");
    setSubKeywordlist(null);
    setServiceAnalysis({
      industry_analysis: null,
      advantage_analysis: null,
      target_needs: null,
    });
    setTitle("");
    setToc("");
    setIntro("");
    setBody("");
    setConclusion("");
    setUpdatedContent("");
    setImagePrompts([]);
    setImages([]);
    setDebugLogs([]);
    updateLog("상태 초기화됨.");
    setFeedback("");
  };

  // 이미지 플레이스홀더(# [숫자])를 실제 이미지로 치환하여 렌더링하는 함수
// 이미지 플레이스홀더(# [숫자] 또는 #[숫자])를 실제 이미지로 치환하여 렌더링하는 함수
const renderUpdatedContent = () => {
  if (!updatedContent) return null;

  // `#[숫자]` 또는 `# [숫자]`를 모두 매칭하는 정규식
  const regex = /# ?\[(\d+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(updatedContent)) !== null) {
    const index = match.index;
    const number = parseInt(match[1], 10);

    // 플레이스홀더 이전 텍스트
    if (lastIndex < index) {
      parts.push(updatedContent.substring(lastIndex, index));
    }

    // 해당 번호의 이미지 가져오기
    const image = images[number - 1];
    if (image) {
      parts.push(
        <img
          key={number}
          src={image.imageUrl}
          alt={`Image ${number}`}
          className="my-4 max-w-xs h-auto rounded-md object-contain" // 이미지 크기 조정 및 스타일링
        />
      );
    } else {
      // 이미지가 없으면 플레이스홀더를 그대로 출력
      parts.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  // 마지막 남은 텍스트 추가
  if (lastIndex < updatedContent.length) {
    parts.push(updatedContent.substring(lastIndex));
  }

  return parts.map((part, index) => (
    <React.Fragment key={index}>{part}</React.Fragment>
  ));
};


return (
  <div className="h-full p-4 bg-gray-50">
    <ResizablePanelGroup 
    direction="horizontal"
    className= "h-full w-full">
      {/* 사이드바 */}
      <ResizablePanel defaultSize={15} minSize={10} maxSize={20} className="bg-gray-100 p-2 ">
        <ul className="space-y-1">
          <li>
            <a href="/keyword" className="block px-2 py-1 rounded-md hover:bg-gray-200">
              키워드 ㅊㅊ
            </a>
          </li>
          <li>
            <a href="/title" className="block px-2 py-1 rounded-md hover:bg-gray-200">
              제목 ㅊㅊ
            </a>
          </li>
          <li>
            <a href="/traffic" className="block px-2 py-1 rounded-md hover:bg-gray-200">
              트래픽 컨텐츠
            </a>
          </li>
          <li>
            <a href="/feedback" className="block px-2 py-1 rounded-md hover:bg-gray-200">
              피드백
            </a>
          </li>
        </ul>
      </ResizablePanel>

      <ResizableHandle className="bg-slate-300" />

      {/* 메인 영역 */}
      <ResizablePanel defaultSize={85} className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex-1">
          <h2 className="text-lg font-bold mb-2">키워드 입력</h2>
            <Input
              placeholder="키워드를 입력하세요"
              value={mainkeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
            />
          </div>
          <div className="flex-1">
          <h2 className="text-lg font-bold mb-2">키워드 입력</h2>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {intro && body && conclusion ? (
              <Button onClick={handleGenerateImagePromptAndImages}>이미지 생성</Button>
            ) : (
              <Button onClick={handleGenerateContent}>컨텐츠 생성</Button>
            )}
          </div>
        </div>

        {/* 상태 초기화 버튼 */}
        <div className="flex gap-2 mb-4">
          <Button variant="destructive" onClick={handleResetStates}>
            상태 초기화
          </Button>
        </div>

        {/* 결과 표시 */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="font-bold mb-2">생성된 콘텐츠</h3>
          <div className="space-y-2 text-sm">
            <pre>키워드: {mainkeyword}</pre>
            <pre>제목: {title}</pre>
            <pre>목차: {toc}</pre>
            <pre>서론: {intro}</pre>
            <pre>본론: {body}</pre>
            <pre>결론: {conclusion}</pre>
          </div>
        </div>

      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);
}