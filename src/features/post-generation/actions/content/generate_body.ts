"use server";
import {  AnalysisResults, BrnadContent } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { bodyPrompt } from "../../prompts/contentPrompt/bodyPrompt";


export async function generateBody(
  mainkeyword: string,
  title: string,
  toc: string,
  intro: string,
  brandcontent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  // 원래 프롬프트 생성
  const generatedPromptRaw = bodyPrompt.generatePrompt(
    mainkeyword,
    title,
    toc,
    intro,
    brandcontent,
    analysis
  );
  // 제어문자 이스케이프 처리: 실제 개행과 탭 문자를 JSON-safe하게 변환
  const generatedPrompt = generatedPromptRaw.replace(/\n/g, "\\n").replace(/\t/g, "\\t");

  const response = await makeClaudeRequest<{
    optimized_body: string;
  }>(
    generatedPrompt, // 이스케이프 처리된 프롬프트 사용
    bodyPrompt.system
  );

  const body = response.optimized_body;
  console.log("generateBody 응답 데이터", JSON.stringify(response));
  
  return { body };
}
