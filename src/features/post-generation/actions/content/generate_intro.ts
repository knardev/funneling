"use server";

import { AnalysisResults, BrnadContent, ToneType } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/contentPrompt/introPrompt";

export async function generateIntro(
  mainKeyword: string,
  title: string,
  toc: string,
  tone: ToneType,
  brandContent?: BrnadContent,
  analysis?: AnalysisResults[]
) {
  // 프롬프트 생성
  const generatedPromptRaw1 = introPrompt.generatePrompt(
    mainKeyword,
    title,
    toc,
    tone,
    brandContent,
    analysis
  );

  if (!tone) {
    throw new Error("Tone is required.");
  }

  try {
    const system = introPrompt.systems[tone];

    if (typeof generatedPromptRaw1.prompt !== "string") {
      throw new Error("Generated prompt must be a string.");
    }

    // 이스케이프 처리: 실제 개행(\n)과 탭(\t)이 JSON 내에서 안전하게 표현되도록 변환
    const generatedPromptRaw2 = generatedPromptRaw1.prompt.replace(/\n/g, "\\n").replace(/\t/g, "\\t");

    console.log("generateIntro 프롬프트", system, generatedPromptRaw2);

    const response = await makeClaudeRequest<{
      optimized_intro: string;
    }>(generatedPromptRaw2, system);

    console.log("generateIntro 응답 데이터", JSON.stringify(response));

    const intro = response.optimized_intro;

    return { intro };
  } catch (error) {
    console.error("Error in generateIntro:", error);
    throw error;
  }
}
