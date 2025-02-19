"use server";

import { Analysis, AnalysisResults, BrnadContent } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/contentPrompt/introPrompt";

export async function generateIntro(
  mainkeyword: string,
  title: string,
  toc: string,
  brandContent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  // 프롬프트 생성
  const generatedPromptRaw = introPrompt.generatePrompt(
    mainkeyword,
    title,
    toc,
    brandContent,
    analysis
  );
  
  // 이스케이프 처리: 실제 개행(\n)과 탭(\t)이 JSON 내에서 안전하게 표현되도록 변환
  const generatedPrompt = generatedPromptRaw.replace(/\n/g, "\\n").replace(/\t/g, "\\t");

  const response = await makeClaudeRequest<{
    optimized_intro: string;
  }>(
    generatedPrompt, // 이스케이프 처리된 프롬프트 사용
    introPrompt.system
  );

  console.log("generateIntro 응답 데이터", JSON.stringify(response));

  const intro = response.optimized_intro;

  return { intro };
}
