"use server";

import { Analysis, AnalysisResults, BrnadContent, ToneType } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { conclusionPrompt } from "../../prompts/contentPrompt/conclusionprompt";
// import { escapeControlCharacters } from "./generate_body";

export async function generateConclusion(
  mainkeyword: string,
  title: string,
  toc: string,
  intro: string,
  body: string,
  tone: ToneType,
  brandcontent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  // 프롬프트 문자열 생성
  const generatedPromptRaw = conclusionPrompt.templates.generatePrompt(
    mainkeyword,
    title,
    toc,
    intro,
    body,
    tone,
    brandcontent,
    analysis
  );
  
  // 제어문자 이스케이프 처리: 개행과 탭을 "\\n", "\\t"로 변환
  const generatedPrompt2 = generatedPromptRaw.prompt.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  const system = conclusionPrompt.systems[tone];
  // 추가: 모든 제어 문자를 Unicode escape 시퀀스로 변환
  // const generatedPrompt = await escapeControlCharacters(generatedPrompt2);
  
  console.log("generateConclusion 프롬프트", generatedPrompt2);
  // Claude API 요청: body와 동일한 방식으로 단일 문자열 프롬프트 전달
  const response = await makeClaudeRequest<{
    optimized_conclusion1: string;
  }>(generatedPrompt2, 
    system);
  
  // 응답에서 결론1만 사용 (결론2는 무시)
  const conclusion = response.optimized_conclusion1;
  console.log("Final conclusion:", conclusion);
  
  return { conclusion };
}
