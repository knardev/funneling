"use client";

import React, { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveFeedback } from "../actions/others/saveFeedback";
import { SidePanel } from "./side-panel";

/**
 * Mypage 컴포넌트
 * 1) 업장명과 업장 핵심가치를 입력 받아 'profiles'에 저장 (로컬스토리지)
 * 2) 기존의 피드백 기능 유지
 */
export function Mypage() {
  // --------------------
  // 1) 프로필 관련 상태
  // --------------------
  const [bizName, setBizName] = useState("");
  const [bizValue, setBizValue] = useState("");
  const [profiles, setProfiles] = useState([]);

  // 첫 진입 시 localStorage에서 기존 프로필 목록 불러오기
  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(storedProfiles);
  }, []);

  // 새 프로필 저장 핸들러
  const handleAddProfile = () => {
    if (!bizName.trim()) {
      alert("업장명을 입력해주세요.");
      return;
    }
    if (!bizValue.trim()) {
      alert("업장 핵심가치를 입력해주세요.");
      return;
    }
    // 새 프로필 객체
    const newProfile = {
      id: Date.now().toString(), // 간단 유니크 ID
      name: bizName,
      value: bizValue,
    };

    // 기존 프로필 + 새 프로필
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);

    // 로컬스토리지에 저장
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));

    // 입력값 초기화
    setBizName("");
    setBizValue("");
    alert("프로필이 저장되었습니다!");
  };

  // --------------------
  // 2) 기존 피드백 기능
  // --------------------
  const [feedback, setFeedback] = useState("");

  const handleSaveFeedback = async () => {
    const result = await saveFeedback(feedback);
    setFeedback("");
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <SidePanel />

        {/* 메인 영역 */}
        <ResizablePanel className="p-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">프로필</h2>

          {/* 프로필 입력 폼 */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="font-semibold">업장명</label>
            <input
              className="border p-2"
              type="text"
              placeholder="예: 'ChatGPT 레스토랑'"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
            />

            <label className="font-semibold">업장 핵심 가치</label>
            <Textarea
              className="border p-2 resize-none"
              placeholder={`예: '신선한 재료를 사용해 최고의 맛과 서비스를 제공'\n또는 '고객 만족을 최우선으로 생각하는 매장 운영'`}
              value={bizValue}
              onChange={(e) => setBizValue(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleAddProfile}
              className="!bg-black !text-white mt-2"
            >
              프로필 추가
            </Button>
          </div>

          {/* 저장된 프로필 목록 */}
          {profiles.length > 0 && (
            <div className="mb-6 border p-2 rounded">
              <h3 className="font-semibold mb-2">저장된 프로필 목록</h3>
              <ul className="list-disc pl-5">
                {profiles.map((profile) => (
                  <li key={profile.id}>
                    <strong>{profile.name}</strong> — {profile.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
