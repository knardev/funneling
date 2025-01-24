// ../../features/post-generation/actions/content/generate_toc.ts

"use server";

import { tocPrompt } from "../../prompts/contentPrompt/tocPrompt";
import { Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";

export async function generateToc(
  mainkeyword: string,
  title: string,
  tone: '정중체' | '음슴체', // 엄격한 타입 지정
  analysis?: Analysis
): Promise<{ toc: string }> {
  console.log("Main Keyword:", mainkeyword);
  console.log("Title:", title);
  console.log("Tone:", tone);

  if (!tone) {
    throw new Error("Tone is required.");
  }

  try {
    const { system, prompt } = tocPrompt.generatePrompt(mainkeyword, title, tone, analysis);
    const response = await makeClaudeRequest<{
      toc: string
    }>(
      prompt,
      system
    );

    const toc = response.toc;
    console.log("generateToc 응답 데이터:", response);
    return { toc };
  } catch (error) {
    console.error("generateToc 오류:", error);
    throw error;
  }
}
