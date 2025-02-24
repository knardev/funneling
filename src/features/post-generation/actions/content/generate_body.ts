"use server";
import {  AnalysisResults, BrnadContent, ToneType } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { bodyPrompt } from "../../prompts/contentPrompt/bodyPrompt";


export async function generateBody(
  mainkeyword: string,
  title: string,
  toc: string,
  intro: string,
  tone: ToneType,
  brandcontent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  // 원래 프롬프트 생성
  const generatedPromptRaw1 = bodyPrompt.generatePrompt(
    mainkeyword,
    title,
    toc,
    intro,
    tone,
    brandcontent,
    analysis
  );
  // 제어문자 이스케이프 처리: 실제 개행과 탭 문자를 JSON-safe하게 변환
  const generatedPrompt2 = generatedPromptRaw1.replace(/\n/g, "\\n").replace(/\t/g, "\\t");

    // 추가: 모든 제어 문자를 안전하게 이스케이프
  // const generatedPrompt = escapeControlCharacters(generatedPrompt2);
  console.log("generateBody 프롬프트", generatedPrompt2);
  const response = await makeClaudeRequest<{
    optimized_body: string;
  }>(
    generatedPrompt2, // 이스케이프 처리된 프롬프트 사용
    bodyPrompt.system
  );

  const body = response.optimized_body;
  console.log("generateBody 응답 데이터", JSON.stringify(response));
  
  return { body };
}

// // 모든 제어 문자를 Unicode escape 시퀀스로 변환하는 함수
// export async function escapeControlCharacters(str: string): Promise<string> {
//   return str.replace(/[\u0000-\u001F\u007F]/g, (char) => {
//     return '\\u' + ('000' + char.charCodeAt(0).toString(16)).slice(-4);
//   });
// }
