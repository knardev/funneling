"use client";

import React, { useState, useEffect } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { SidePanel } from "./side-panel";
import { makeClaudeRequest } from "../utils/ai/claude";
import { profileAnalysisPrompt } from "../prompts/profile/profileAnalysisprompt";
import { Analysis,ProfileType,BizValueSegment, BrnadContent } from "../types";
import { title } from "process";



/**
 * Profile 컴포넌트
 * - 업장명과 불렛 형태의 업장 가치를 입력받아 프로필에 저장합니다.
 * - 기본 3개의 업장 가치 입력 필드를 제공하며, 추가/제거, 수정, 삭제 기능을 지원합니다.
 */
export function Profile() {
  // 신규 프로필 입력 상태
  const [bizName, setBizName] = useState("");
  const [bizValues, setBizValues] = useState<string[]>(["", "", ""]);
  // 저장된 프로필 목록 상태
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  
  // 수정 모드 관련 상태
  const [editingProfile, setEditingProfile] = useState<ProfileType | null>(null);
  const [editBizName, setEditBizName] = useState("");
  const [editBizValues, setEditBizValues] = useState<string[]>([]);

  // 컴포넌트 첫 로딩 시 localStorage에서 기존 프로필 불러오기
  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
    setProfiles(storedProfiles);
  }, []);

  // ================================
  // 신규 프로필 생성 관련 함수
  // ================================
  // 특정 인덱스의 업장가치 수정 (신규)
  const handleBizValueChange = (index: number, newValue: string) => {
    const newBizValues = [...bizValues];
    newBizValues[index] = newValue;
    setBizValues(newBizValues);
  };

  // 신규 업장가치 입력 필드 추가
  const addBizValueField = () => {
    setBizValues([...bizValues, ""]);
  };

  // 신규 업장가치 입력 필드 제거
  const removeBizValueField = (index: number) => {
    const newBizValues = bizValues.filter((_, i) => i !== index);
    setBizValues(newBizValues);
  };

  // 신규 프로필 저장 핸들러
  const handleAddProfile = () => {
    if (!bizName.trim()) {
      alert("업장명을 입력해주세요.");
      return;
    }
    if (bizValues.length === 0 || bizValues.some((val) => !val.trim())) {
      alert("모든 업장가치를 입력해주세요.");
      return;
    }

    const mappedBizValues: BizValueSegment[] = bizValues.map((value, index) => ({
      order: index + 1,
      value: value.trim(),
    }));

    const newProfile: ProfileType = {
      id: Date.now().toString(),
      name: bizName.trim(),
      bizValues: mappedBizValues,
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));

    setBizName("");
    setBizValues(["", "", ""]);
    alert("프로필이 저장되었습니다!");
  };

  // ================================
  // 프로필 수정/삭제 관련 함수
  // ================================
  // 프로필 삭제 핸들러
  const handleDeleteProfile = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const updatedProfiles = profiles.filter((profile) => profile.id !== id);
    setProfiles(updatedProfiles);
    localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
  };

  // 수정 모드로 전환 (선택한 프로필의 데이터를 편집 상태에 반영)
  const handleEditProfile = (profile: ProfileType) => {
    setEditingProfile(profile);
    setEditBizName(profile.name);
    // 기존 bizValues를 string 배열로 변환
    setEditBizValues(profile.bizValues.map((segment) => segment.value));
  };

  // 수정 모드 내 업장가치 변경
  const handleEditBizValueChange = (index: number, newValue: string) => {
    const newValues = [...editBizValues];
    newValues[index] = newValue;
    setEditBizValues(newValues);
  };

  // 수정 모드 내 업장가치 필드 추가
  const addEditBizValueField = () => {
    setEditBizValues([...editBizValues, ""]);
  };

  // 수정 모드 내 업장가치 필드 제거
  const removeEditBizValueField = (index: number) => {
    const newValues = editBizValues.filter((_, i) => i !== index);
    setEditBizValues(newValues);
  };

  // 수정된 프로필 업데이트 핸들러
  const handleUpdateProfile = () => {
    if (!editBizName.trim()) {
      alert("업장명을 입력해주세요.");
      return;
    }
    if (editBizValues.length === 0 || editBizValues.some((val) => !val.trim())) {
      alert("모든 업장가치를 입력해주세요.");
      return;
    }

    const mappedBizValues: BizValueSegment[] = editBizValues.map((value, index) => ({
      order: index + 1,
      value: value.trim(),
    }));

    if (editingProfile) {
      const updatedProfile: ProfileType = {
        ...editingProfile,
        name: editBizName.trim(),
        bizValues: mappedBizValues,
      };

      const updatedProfiles = profiles.map((profile) =>
        profile.id === editingProfile.id ? updatedProfile : profile
      );
      setProfiles(updatedProfiles);
      localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
      setEditingProfile(null);
      setEditBizName("");
      setEditBizValues([]);
      alert("프로필이 업데이트되었습니다!");
    }
  };

  // 수정 모드 취소 핸들러
  const handleCancelEdit = () => {
    setEditingProfile(null);
    setEditBizName("");
    setEditBizValues([]);
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* 사이드바 */}
        <SidePanel />

        {/* 메인 영역 */}
        <ResizablePanel className="p-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">프로필</h2>

          {/* 신규 프로필 입력 폼 */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="font-semibold">업장명</label>
            <input
              className="border p-2"
              type="text"
              placeholder="예: 'ChatGPT 레스토랑'"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
            />

            <label className="font-semibold">업장 핵심가치</label>
            {bizValues.map((value, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <span>{index + 1}.</span>
                <input
                  className="border p-2 flex-1"
                  type="text"
                  placeholder="업장 가치를 입력하세요"
                  value={value}
                  onChange={(e) => handleBizValueChange(index, e.target.value)}
                />
                <Button variant="destructive" onClick={() => removeBizValueField(index)}>
                  제거
                </Button>
              </div>
            ))}
            <Button onClick={addBizValueField} className="!bg-black !text-white mt-2">
              항목 추가
            </Button>

            <Button onClick={handleAddProfile} className="!bg-black !text-white mt-2">
              프로필 추가
            </Button>
          </div>

          {/* 수정 모드: 선택한 프로필 수정 폼 */}
          {editingProfile && (
            <div className="flex flex-col gap-2 mb-4 p-4 border rounded bg-gray-100">
              <h3 className="font-semibold">프로필 수정</h3>
              <label className="font-semibold">업장명</label>
              <input
                className="border p-2"
                type="text"
                value={editBizName}
                onChange={(e) => setEditBizName(e.target.value)}
              />

              <label className="font-semibold">업장 핵심가치</label>
              {editBizValues.map((value, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span>{index + 1}.</span>
                  <input
                    className="border p-2 flex-1"
                    type="text"
                    placeholder="업장 가치를 입력하세요"
                    value={value}
                    onChange={(e) => handleEditBizValueChange(index, e.target.value)}
                  />
                  <Button variant="destructive" onClick={() => removeEditBizValueField(index)}>
                    제거
                  </Button>
                </div>
              ))}
              <Button onClick={addEditBizValueField} className="!text-white mt-2">
                항목 추가
              </Button>
              <div className="flex gap-2 mt-2">
                <Button onClick={handleUpdateProfile} className="!bg-black !text-white">
                  업데이트
                </Button>
                <Button variant="secondary" onClick={handleCancelEdit}>
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 저장된 프로필 목록 */}
          {profiles.length > 0 && (
            <div className="mb-6 border p-2 rounded">
              <h3 className="font-semibold mb-2">프로필 목록</h3>
              <ul className="list-disc pl-5">
                {profiles.map((profile) => (
                  <li key={profile.id} className="mb-2">

                    <div className="flex items-center justify-between">
                      <strong>{profile.name}</strong>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditProfile(profile)}>✏️</Button>
                        <Button onClick={() => handleDeleteProfile(profile.id)}>❌</Button>
                      </div>
                    </div>
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



