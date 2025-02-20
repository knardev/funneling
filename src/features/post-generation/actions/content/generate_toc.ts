// ../../features/post-generation/actions/content/generate_toc.ts

"use server";

import { tocPrompt } from "../../prompts/contentPrompt/tocPrompt";
import { AnalysisResults, BrnadContent } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";

export async function generateToc(
  mainkeyword: string,
  title: string,
  brandContent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  console.log("mainkeyword:", mainkeyword);
  console.log("title:", title);

  // 프롬프트 생성
  const generatedPrompt = tocPrompt.generatePrompt(
    mainkeyword,
    title,
    brandContent,
    analysis
  );
  console.log("Generated Prompt:", generatedPrompt);

  // API 요청 전, 시스템 프롬프트도 출력 (필요한 경우)
  console.log("System Prompt:", tocPrompt.system);

  const response = await makeClaudeRequest<{
    toc: string;
  }>(generatedPrompt, tocPrompt.system);

  console.log("generateToc 응답 데이터:", response);

  const toc = response.toc;
  return {
    toc: toc,
  };
}
