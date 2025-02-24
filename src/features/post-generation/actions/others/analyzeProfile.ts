"use server";

import { profileAnalysisPrompt } from "../../prompts/profile/profileAnalysisprompt";
import { BrnadContent, AnalysisResults } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";

export async function analyzeProfile(
  mainkeyword: string,
  title: string,
  brandContent: BrnadContent
): Promise<AnalysisResults[]> {  // ✅ Promise 타입 수정
  console.log(mainkeyword);
  console.log(title);

  const response = await makeClaudeRequest<{
    targetProfile: {
      description: string;
      characteristics: string[];
    };
    needsAnalysis: AnalysisResults[];
  }>(
    profileAnalysisPrompt.generatePrompt(mainkeyword, title, brandContent),
    profileAnalysisPrompt.system
  );

  console.log("analyzeProfile 응답 데이터", JSON.stringify(response));

  return response.needsAnalysis; // ✅ needsAnalysis만 반환 (객체 감싸기 제거)
}
