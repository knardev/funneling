"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidePanel } from "../side-panel";

// 하위 컴포넌트
import { BrandPanelInput } from "./BrandPanelInput";
import { BrandPanelOutput } from "./BrandPanelOutput";

// 액션 / 타입 / 유틸
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { initializeContent } from "@/features/post-generation/actions/others/initialize_content";
import { generateToc } from "@/features/post-generation/actions/content/generate_toc";
import { generateIntro } from "@/features/post-generation/actions/content/generate_intro";
import { generateBody } from "@/features/post-generation/actions/content/generate_body";
import { generateConclusion } from "@/features/post-generation/actions/content/generate_conclusion";
import { generateImagePrompt } from "@/features/post-generation/actions/image/generate_imagePrompt";
import { generateImage } from "@/features/post-generation/actions/image/generate_image";
import { saveFinalResult } from "@/features/post-generation/actions/others/save_finalResult";
import { AnalysisResults, FinalResult,BrnadContent, BizValueSegment } from "@/features/post-generation/types";
import { saveFeedback } from "@/features/post-generation/actions/others/saveFeedback";
import { analyzeProfile } from "../../actions/others/analyzeProfile";

export function BrandPanel() {
  // -------------------------------------------------
  // 0) 단계 관리: generationStep
  //    0 -> 아직 아무것도 생성 안 함
  //    1 -> 목차만 생성된 상태 (사용자 수정 가능)
  //    2 -> 서론/본론/결론까지 생성 완료
  // -------------------------------------------------
  const [generationStep, setGenerationStep] = useState(0);

  // -------------------------------------
  // A) 프로필 (드롭다운) + 상태
  // -------------------------------------
  const [profiles, setProfiles] = useState<{ id: string; name: string; bizValues: BizValueSegment[] }[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");

  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(storedProfiles);
  }, []);

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    const foundProfile = profiles.find((p) => p.id === id);
    if (foundProfile) {
      setServiceName(foundProfile.name);
      // foundProfile.bizValues는 BizValueSegment[] 이므로, 각 segment의 value를 추출
      setServiceValues(foundProfile.bizValues.map(segment => segment.value) || []);
    }
  };
  
  // const handleBrandContent = (brandContent: BrnadContent) => {
  //   brandContent.topic = topic;
  //   brandContent.serviceName = serviceName;
  //   brandContent.serviceValues = serviceValues;
  //   };

  // -------------------------------------
  // B) 입력 상태
  // -------------------------------------
  const [mainkeyword, setMainKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceValues, setServiceValues] = useState<string[]>([]);

  // -------------------------------------
  // C) 결과 상태
  // -------------------------------------

  const [subkeywordlist, setSubkeywordlist] = useState<string[] | null>(null);
  const [toc, setToc] = useState(""); // 최종 TOC 문자열 (줄바꿈으로 join)
  const [tocItems, setTocItems] = useState<string[]>([]); // 배열 상태로 저장
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");
  const [imagePrompts, setImagePrompts] = useState<{ id: string; prompt: string }[]>([]);

  // -------------------------------------
  // D) 이미지 관련
  // -------------------------------------
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [imagesById, setImagesById] = useState<Record<string, { id: string; imageUrl: string }>>({});

  // -------------------------------------
  // E) 기타 상태
  // -------------------------------------
  const [feedback, setFeedback] = useState("");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [isContentGenerated, setIsContentGenerated] = useState(false);

  // -------------------------------------
  // 유틸/공통 함수들
  // -------------------------------------
  function updateLog(message: string) {
    setDebugLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  }

  function resetAllStates() {
    setSubkeywordlist(null);
    setToc("");
    setTocItems([]);
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
    setGenerationStep(0);
  }

  function renderWithLineBreaks(text: string) {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  }

  function postProcessUpdatedContent(rawContent: string): string {
    let content = rawContent;
    const CORRECT_MARKER = "@@@CORRECT_PLACEHOLDER@@@";
    const correctPlaceholders: string[] = [];
    content = content.replace(/#\[image(\d+)\]/gi, (match, num) => {
      correctPlaceholders.push(match);
      return CORRECT_MARKER + (correctPlaceholders.length - 1);
    });
    content = content.replace(
      /#\s?\(?(\d+)\)?|\[image(\d+)\]|\[(\d+)\]/gi,
      (_, g1, g2, g3) => {
        const imageNum = g1 || g2 || g3;
        return `#[image${imageNum}]`;
      }
    );
    content = content.replace(new RegExp(CORRECT_MARKER + "(\\d+)", "g"), (_, idx) =>
      correctPlaceholders[parseInt(idx, 10)]
    );
    content = content.replace(/(\#\[image\d+\])\s*,?\s*\{.*?\}(,\s*KOREA)?/gi, "$1");
    return content;
  }

  // -------------------------------------
  // 복사 기능
  // -------------------------------------
  async function handleCopyIntroBodyConclusion() {
    const combinedText = [intro, body, conclusion]
      .filter((t) => t.trim().length > 0)
      .join("\n\n");
    try {
      if (!combinedText) {
        alert("⚠️ 복사할 내용이 없습니다.");
        return;
      }
      await navigator.clipboard.writeText(combinedText);
      alert("✅ 본문이 복사되었습니다!");
    } catch (error) {
      console.error("복사 실패:", error);
      alert("❌ 복사 중 오류가 발생했습니다.");
    }
  }

  async function handleCopyUpdatedContentWithImages() {
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
      alert("✅ 텍스트+이미지가 복사되었습니다!");
    } catch (error) {
      console.error("복사 실패:", error);
      alert("❌ 복사 중 오류가 발생했습니다.");
    }
  }

  // -------------------------------------
  // 다운로드 기능
  // -------------------------------------
  function handleDownloadTxt() {
    if (!updatedContent) {
      alert("⚠️ 다운로드할 텍스트가 없습니다.");
      return;
    }
    try {
      const blob = new Blob([updatedContent], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "content.txt");
    } catch (error) {
      console.error("TXT 다운로드 실패:", error);
      alert("❌ TXT 다운로드 중 오류가 발생했습니다.");
    }
  }

  async function handleDownloadImagesZip() {
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
      console.error("이미지 ZIP 다운로드 실패:", error);
      alert("❌ 이미지 ZIP 다운로드 중 오류가 발생했습니다.");
    }
  }

  // -------------------------------------
  // 서버 액션들
  // -------------------------------------
  async function handleSaveFeedback() {
    updateLog("피드백 전송 중...");
    await saveFeedback(feedback);
    updateLog("피드백 전송 완료");
    setFeedback("");
  }
  const brandContent: BrnadContent = {
    topic,
    serviceName,
    serviceValues,
  };

  async function handleProfileAnalysis() {
    updateLog("프로필 분석 중...");
    console.log("brandContent:", brandContent);

    // BrandPanelInput에서 받은 topic, serviceName, serviceValues를 포함하는 객체 생성
    const result = analyzeProfile(mainkeyword, title, brandContent);
    updateLog("프로필 분석 완료");
    return result;
  }
  

  async function handleGenerateToc(currentTitle: string, analysis?: AnalysisResults[]) {
    updateLog("목차 생성 중...");
    const result = await generateToc(mainkeyword, currentTitle, brandContent, analysis);
    // 응답이 배열이면 그대로 사용
    if (Array.isArray(result.toc)) {
      setTocItems(result.toc);
      setToc(result.toc.join("\n"));
    } else {
      setTocItems(result.toc.split("\n"));
      setToc(result.toc);
    }
    updateLog("목차 생성 완료");
    return result.toc;
  }

  async function handleGenerateIntro(

    currentTitle: string,
    currentToc: string
  ) {
    updateLog("서론 생성 중...");
    const result = await generateIntro(mainkeyword, currentTitle, currentToc);
    setIntro(result.intro);
    updateLog("서론 생성 완료");
    return result.intro;
  }

  async function handleGenerateBody(

    currentTitle: string,
    currentToc: string,
    currentIntro: string
  ) {
    updateLog("본론 생성 중...");
    const result = await generateBody(mainkeyword, currentTitle, currentToc, currentIntro);
    setBody(result.body);
    updateLog("본론 생성 완료");
    return result.body;
  }

  async function handleGenerateConclusion(

    currentTitle: string,
    currentToc: string,
    currentIntro: string,
    currentBody: string
  ) {
    updateLog("결론 생성 중...");
    const result = await generateConclusion(mainkeyword, currentTitle, currentToc, currentIntro, currentBody);
    setConclusion(result.conclusion);
    updateLog("결론 생성 완료");
    return result.conclusion;
  }

  async function handleGenerateImagePrompt(

    currentContent: { title: string; toc: string[]; intro: string; body: string; conclusion: string; }
  ) {
    updateLog("이미지 프롬프트 생성 중...");
    const result = await generateImagePrompt(currentContent);
    let processedContent = "";
    if (result.updatedContent) {
      processedContent = postProcessUpdatedContent(result.updatedContent);
      setUpdatedContent(processedContent);
    }
    setImagePrompts(result.imagePrompts);
    updateLog("이미지 프롬프트 생성 완료");
    return { updatedContent: processedContent || "", imagePrompts: result.imagePrompts };
  }

  async function handleGenerateImages(imagePromptsData: { id: string; prompt: string }[]) {
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
  }

  async function handleSaveFinalResult(finalResult: FinalResult) {
    try {
      updateLog("최종 결과 저장 중...");
      await saveFinalResult(finalResult);
      updateLog("최종 결과 저장 완료");
    } catch (error) {
      updateLog(`최종 결과 저장 오류: ${error}`);
      console.error("최종 결과 저장 오류:", error);
    }
  }

  // -------------------------------------
  // 4) 목차 배열 편집 로직
  // -------------------------------------
  function parseTocToItems(tocString: string) {
    const lines = tocString.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return lines;
  }

  function assembleTocFromItems(items: string[]): string {
    return items.join("\n");
  }

  function handleTocItemChange(index: number, newValue: string) {
    setTocItems((prev) => {
      const copy = [...prev];
      copy[index] = newValue;
      return copy;
    });
  }

  function handleTocItemDelete(index: number) {
    setTocItems((prev) => prev.filter((_, i) => i !== index));
  }

  // -------------------------------------
  // 5) 통합 핸들러: “컨텐츠 생성” 버튼 클릭 시
  // -------------------------------------
  async function handleGenerateContent() {
    console.log("컨텐츠 생성 핸들러 호출됨")
    try {
      // Step 0: 목차만 생성
      if (generationStep === 0) {

        resetAllStates();
        setGenerationStep(0);
        updateLog("🔄 [1단계] 목차만 생성 시작...");
        setProgress(10);
        setProgressMessage("컨텐츠 초기화 중...");
        const profileAnalysisResult = await handleProfileAnalysis();
        setProgress(30);
        setProgressMessage("목차 생성 중...");
        const tocResult = await handleGenerateToc(title, profileAnalysisResult);
        // 응답이 배열이면 그대로 사용
        if (Array.isArray(tocResult)) {
          setTocItems(tocResult);
          setToc(tocResult.join("\n"));
        } else {
          setTocItems(parseTocToItems(tocResult));
          setToc(tocResult);
        }
        setProgress(100);
        setProgressMessage("목차 생성 완료! 수정해보세요.");
        setGenerationStep(1);
        updateLog("✅ 목차만 생성 완료");
        return;
      }
      // Step 1: 서론/본론/결론 생성 (수정된 목차를 input으로 사용)
      if (generationStep === 1) {
        updateLog("🔄 [2단계] 서론/본론/결론 생성 시작...");
        setProgress(10);
        setProgressMessage("서론 생성 중...");
        const newTocString = assembleTocFromItems(tocItems);
        setToc(newTocString);
        const introResult = await handleGenerateIntro( title, newTocString);
        setProgress(40);
        setProgressMessage("본론 생성 중...");
        const bodyResult = await handleGenerateBody( title, newTocString, introResult);
        setProgress(70);
        setProgressMessage("결론 생성 중...");
        const conclusionResult = await handleGenerateConclusion(title, newTocString, introResult, bodyResult);
        setProgress(100);
        setProgressMessage("서론/본론/결론 생성 완료!");
        setIsContentGenerated(true);
        setGenerationStep(2);
        updateLog("✅ 서론/본론/결론 생성 완료");
      }
    } catch (error) {
      console.error("컨텐츠 생성 오류:", error);
      updateLog(`❌ 컨텐츠 생성 오류: ${error}`);
      setProgress(0);
      setProgressMessage("");
    }
  }

  async function handleGenerateImagePromptAndImages() {
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
      const imagePromptResult = await handleGenerateImagePrompt( currentContent);
      setProgress(50);
      setProgressMessage("이미지 실제 생성 중...");
      const imagesResult = await handleGenerateImages(imagePromptResult.imagePrompts);
      setProgress(80);
      setProgressMessage("최종 결과 저장 중...");
      const finalResult: FinalResult = {
        mainKeyword: mainkeyword,
        title,
        toc,
        content: { intro, body, conclusion },
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
  }

  // -------------------------------------
  // 6) 최종 콘텐츠 렌더링 (이미지 치환)
  // -------------------------------------
  function renderUpdatedContent() {
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
  }

  // -------------------------------------
  // 7) 드롭다운 열림/닫힘
  // -------------------------------------
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  // -------------------------------------
  // 8) 최종 렌더링
  // -------------------------------------
  const isUpdatedContentExist = !!updatedContent;

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup direction="horizontal">
        <SidePanel />
        <ResizableHandle />
        <ResizablePanel className="overflow-hidden">
          <div className="flex w-full h-full">
            <BrandPanelInput
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              handleSelectProfile={handleSelectProfile}
              mainkeyword={mainkeyword}
              setMainKeyword={setMainKeyword}
              title={title}
              setTitle={setTitle}
              topic={topic}
              setTopic={setTopic}
              serviceName={serviceName}
              setServiceName={setServiceName}
              serviceValues={serviceValues}
              setServiceValues={setServiceValues}
              progress={progress}
              progressMessage={progressMessage}
              isContentGenerated={isContentGenerated}
              isUpdatedContentExist={isUpdatedContentExist}
              handleGenerateContent={handleGenerateContent}
              handleGenerateImagePromptAndImages={handleGenerateImagePromptAndImages}
              generationStep={generationStep}
              toc={toc}
            />
            <BrandPanelOutput
              generationStep={generationStep}
              tocItems={tocItems}
              setTocItems={setTocItems}
              handleTocItemChange={handleTocItemChange}
              handleTocItemDelete={handleTocItemDelete}
              isUpdatedContentExist={isUpdatedContentExist}
              isContentGenerated={isContentGenerated}
              mainkeyword={mainkeyword}
              title={title}
              toc={toc}
              intro={intro}
              body={body}
              conclusion={conclusion}
              renderWithLineBreaks={renderWithLineBreaks}
              renderUpdatedContent={renderUpdatedContent}
              handleCopyIntroBodyConclusion={handleCopyIntroBodyConclusion}
              handleCopyUpdatedContentWithImages={handleCopyUpdatedContentWithImages}
              handleDownloadTxt={handleDownloadTxt}
              handleDownloadImagesZip={handleDownloadImagesZip}
              isDropdownOpen={isDropdownOpen}
              toggleDropdown={toggleDropdown}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
