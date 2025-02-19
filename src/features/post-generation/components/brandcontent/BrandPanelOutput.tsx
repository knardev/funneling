"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import saveAs from "file-saver";

interface BrandPanelOutputProps {
  generationStep: number;
  tocItems: string[];
  setTocItems: React.Dispatch<React.SetStateAction<string[]>>;
  handleTocItemChange: (index: number, newValue: string) => void;
  handleTocItemDelete: (index: number) => void;
  isUpdatedContentExist: boolean;
  isContentGenerated: boolean;
  mainkeyword: string;
  title: string;
  toc: string;
  intro: string;
  body: string;
  conclusion: string;
  renderWithLineBreaks: (text: string) => React.ReactNode;
  renderUpdatedContent: () => React.ReactNode;
  handleCopyIntroBodyConclusion: () => Promise<void>;
  handleCopyUpdatedContentWithImages: () => Promise<void>;
  handleDownloadTxt: () => void;
  handleDownloadImagesZip: () => Promise<void>;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
}

export function BrandPanelOutput({
  generationStep,
  tocItems,
  setTocItems,
  handleTocItemChange,
  handleTocItemDelete,
  isUpdatedContentExist,
  isContentGenerated,
  mainkeyword,
  title,
  toc,
  intro,
  body,
  conclusion,
  renderWithLineBreaks,
  renderUpdatedContent,
  handleCopyIntroBodyConclusion,
  handleCopyUpdatedContentWithImages,
  handleDownloadTxt,
  handleDownloadImagesZip,
  isDropdownOpen,
  toggleDropdown,
}: BrandPanelOutputProps) {
  const renderTocEditor = () => {
    return (
      <div className="space-y-2">
        {tocItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="border flex-1 p-1"
              value={item}
              onChange={(e) => handleTocItemChange(i, e.target.value)}
            />
            <Button variant="destructive" size="sm" onClick={() => handleTocItemDelete(i)}>
              X
            </Button>
          </div>
        ))}
        {tocItems.length === 0 && (
          <p className="text-gray-500 text-sm">
            목차가 없습니다. (모든 항목을 삭제하셨을 수 있습니다.)
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-6 overflow-y-auto">
      <div className="bg-white rounded-md p-4 shadow">
        {generationStep === 1 && !isUpdatedContentExist && (
          <div className="space-y-4">
            <h3 className="font-bold mb-2">📚 생성된 목차 (수정/삭제 가능)</h3>
            {renderTocEditor()}
            <div className="font-bold whitespace-pre-wrap break-words">
              📝 키워드: {mainkeyword}
            </div>
            <div className="font-bold whitespace-pre-wrap break-words">
              🏷️ 제목: {title}
            </div>
            <p className="text-gray-600 text-sm">
              “컨텐츠 생성” 버튼을 다시 누르면 서론/본론/결론을 이어서 생성합니다.
            </p>
          </div>
        )}

        {generationStep >= 2 && !isUpdatedContentExist && isContentGenerated && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center">
              📑 생성된 콘텐츠
              <div className="flex-1" />
              <Button className="ml-auto" onClick={handleCopyIntroBodyConclusion}>
                📋 복사
              </Button>
              <div className="relative inline-block">
                <Button variant="outline" className="ml-2" onClick={toggleDropdown}>
                  다운로드 ▼
                </Button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                    <button
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                      onClick={() => {
                        toggleDropdown();
                        const combinedText = [intro, body, conclusion]
                          .filter((t) => t.trim().length > 0)
                          .join("\n\n");
                        if (!combinedText) {
                          alert("⚠️ 저장할 내용이 없습니다.");
                          return;
                        }
                        const blob = new Blob([combinedText], { type: "text/plain;charset=utf-8" });
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
            <div className="font-bold whitespace-pre-wrap break-words">
              📝 키워드: {mainkeyword}
            </div>
            <div className="font-bold whitespace-pre-wrap break-words">
              🏷️ 제목: {title}
            </div>
            <div className="font-bold whitespace-pre-wrap break-words">
              📚 최종 목차: {toc}
            </div>
            <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(intro)}</div>
            <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(body)}</div>
            <div className="whitespace-pre-wrap break-words">{renderWithLineBreaks(conclusion)}</div>
          </div>
        )}

        {isUpdatedContentExist && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">최종 콘텐츠:</span>
              <div className="flex items-center gap-2">
                <Button onClick={handleCopyUpdatedContentWithImages}>📋 복사</Button>
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
            <div className="whitespace-pre-wrap break-words">{renderUpdatedContent()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
