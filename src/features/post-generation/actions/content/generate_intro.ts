"use server";

import { Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/contentPrompt/introPrompt";

export async function generateIntro(
  mainkeyword: string,
  title: string,
  toc: string,
  tone: "정중체" | "음슴체",
  analysis?: Analysis
) {
  // introPrompt.generatePrompt의 실행 결과 저장
  const generatedPrompt = introPrompt.generatePrompt(
    mainkeyword,
    title,
    toc,
    tone,
    analysis
  );

  if (!tone) {
    throw new Error("Tone is required.");
  }
  try{
    const { system, prompt } = generatedPrompt;
    const response = await makeClaudeRequest<{
      optimized_intro: string;
    }>(
      prompt,
      system
    );
    console.log("generateIntro 응답 데이터", JSON.stringify(response));
    const intro = response.optimized_intro;

    return {
      intro: intro,
    };
  }
  catch (error) {
    console.error("generateIntro 오류:", error);
    throw error;
  }
}
