"use server";

import { Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/contentPrompt/introPrompt";

export async function generateIntro(
  mainkeyword: string,
  title: string,
  toc: string,
  analysis?: Analysis
) {
  // introPrompt.generatePrompt의 실행 결과 저장
  const generatedPrompt = introPrompt.generatePrompt(
    mainkeyword,
    title,
    toc,
    analysis
  );


  const response = await makeClaudeRequest<{
    optimized_intro: string;
  }>(
    generatedPrompt, // 여기서 사용
    introPrompt.system
  );

  console.log("generateIntro 응답 데이터", JSON.stringify(response));

  const intro = response.optimized_intro;

  return {
    intro: intro,
  };
}
