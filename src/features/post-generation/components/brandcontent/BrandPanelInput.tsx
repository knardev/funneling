"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BizValueSegment, BrandPanelInputProps, ProgressBarProps } from "../../types";

export function BrandPanelInput({
  profiles,
  selectedProfileId,
  handleSelectProfile,
  mainkeyword,
  setMainKeyword,
  title,
  setTitle,
  topic,
  setTopic,
  serviceName,
  setServiceName,
  serviceValues,
  setServiceValues,
  progress,
  progressMessage,
  isContentGenerated,
  isUpdatedContentExist,
  handleGenerateContent,
  handleGenerateImagePromptAndImages,
  generationStep,
  toc,
  tone,         // 부모로부터 전달받은 톤 상태
  setTone,      // 부모로부터 전달받은 톤 변경 함수
}: BrandPanelInputProps & { tone: "정중체" | "음슴체"; setTone: React.Dispatch<React.SetStateAction<"정중체" | "음슴체">> }) {
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const toneDropdownRef = useRef<HTMLDivElement>(null);

  const toggleToneDropdown = () => {
    setIsToneDropdownOpen(!isToneDropdownOpen);
  };

  return (
    <div className="w-1/2 p-6 space-y-4 border-r overflow-y-auto">
      <div className="bg-white rounded-md p-4 shadow space-y-4">
        {/* (1) 프로필 선택 - 키워드 입력 위에 배치 */}
        <div className="flex flex-col mb-4">
          <label className="font-bold mb-1">프로필 선택</label>
          <select
            className="border p-2 rounded"
            value={selectedProfileId}
            onChange={(e) => handleSelectProfile(e.target.value)}
          >
            <option value="">프로필</option>
            {profiles.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* (2) 키워드 입력 및 톤 선택 */}
        <div className="flex items-end space-x-4">
          <div className="flex flex-col w-2/3">
            <label className="font-bold mb-1">키워드 입력</label>
            <Input
              placeholder="키워드를 입력하세요"
              value={mainkeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
            />
          </div>
          {/* 톤 선택 드롭다운 */}
          <div className="w-32 relative" ref={toneDropdownRef}>
            <Button
              variant="outline"
              onClick={toggleToneDropdown}
              className="w-full flex justify-between items-center"
            >
              {tone ? tone : "말투 선택"}
              <svg
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${isToneDropdownOpen ? "transform rotate-180" : ""}`}
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
        </div>

        {/* (3) 주제 입력 */}
        <div className="flex flex-col">
          <label className="font-bold mb-1">주제 입력</label>
          <Input
            placeholder="주제를 입력하세요"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* (4) 제목 입력 */}
        <div className="flex flex-col">
          <label className="font-bold mb-1">제목 입력</label>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* (5) 컨텐츠 생성 / 이미지 생성 버튼 */}
        <div className="flex items-center gap-2 pt-2">
          {!isContentGenerated || isUpdatedContentExist ? (
            <Button onClick={handleGenerateContent} disabled={progress > 0 && progress < 100}>
              📝 컨텐츠 생성
            </Button>
          ) : (
            <Button onClick={handleGenerateImagePromptAndImages} disabled={progress > 0 && progress < 100}>
              이미지 생성
            </Button>
          )}
        </div>
      </div>

      {/* 진행도 표시 */}
      {progress > 0 && (
        <div className="bg-white rounded-md p-4 shadow">
          <ProgressBar progress={progress} message={progressMessage} />
        </div>
      )}

      {/* 컨텐츠 생성 완료 후 혹은 목차 생성 후 수정된 목차 표시 */}
      {generationStep >= 1 && (
        <div className="mt-4 p-2 rounded">
          <label className="font-bold mb-1">수정된 목차:</label>
          <pre className="whitespace-pre-wrap">{toc}</pre>
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ progress, message }: ProgressBarProps) {
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
