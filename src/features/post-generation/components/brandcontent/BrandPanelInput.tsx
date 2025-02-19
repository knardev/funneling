"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BizValueSegment, ProgressBarProps } from "../../types";



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

interface BrandPanelInputProps {
  // 프로필 관련
  profiles: { id: string; name: string; bizValues: BizValueSegment[] }[];
  selectedProfileId: string;
  handleSelectProfile: (id: string) => void;
  // 입력 상태
  mainkeyword: string;
  setMainKeyword: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  serviceName: string;
  setServiceName: (value: string) => void;
  serviceValues: string[];
  setServiceValues: (value: string[]) => void;
  // 진행도 / 상태
  progress: number;
  progressMessage: string;
  isContentGenerated: boolean;
  isUpdatedContentExist: boolean;
  // 새로 추가: generationStep와 toc (수정된 목차)
  generationStep: number;
  toc: string;
  // 핸들러
  handleGenerateContent: () => void;
  handleGenerateImagePromptAndImages: () => void;
}

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
  generationStep,
  toc,
  handleGenerateContent,
  handleGenerateImagePromptAndImages,
}: BrandPanelInputProps) {
  return (
    <div className="w-1/2 p-6 space-y-4 border-r overflow-y-auto">
      <div className="bg-white rounded-md p-4 shadow space-y-4">
        {/* (1) 키워드와 프로필 드롭다운 */}
        <div className="flex flex-col mb-4 overflow-x-auto">
            <div className="flex items-end space-x-4">
            <div className="flex flex-col w-2/3">
              <label className="font-bold mb-1">키워드 입력</label>
              <Input
              placeholder="키워드를 입력하세요"
              value={mainkeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>
            <select
              className="border p-2 rounded w-1/3"
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
        </div>
        {/* (2) 주제 입력 */}
        <div className="flex flex-col">
          <label className="font-bold mb-1">주제 입력</label>
          <Input
            placeholder="주제를 입력하세요"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        {/* (3) 제목 입력 */}
        <div className="flex flex-col">
          <label className="font-bold mb-1">제목 입력</label>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {/* (4) 컨텐츠 생성 / 이미지 생성 버튼 */}
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
      {/* 컨텐츠 생성 완료 후 혹은 목차 생성 후, 수정된 목차 보여주기 */}
      {generationStep >= 1 && (
        <div className="mt-4 p-2 rounded">
          <label className="font-bold mb-1">수정된 목차:</label>
          <pre className="whitespace-pre-wrap">{toc}</pre>
        </div>
      )}
    </div>
  );
}
