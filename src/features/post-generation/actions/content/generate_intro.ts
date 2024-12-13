"use server";

import { Analysis, KeywordObj} from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/contentPrompt/introPrompt";

export async function generateIntro(
    keyword: KeywordObj,
    title: string,
    toc:string,
    analysis?: Analysis,
) {

  const response= await makeClaudeRequest<{
    optimized_intro:string
  }>(
    introPrompt.generatePrompt(
      keyword.keyword,
      keyword.subkeywords,
      title,
      toc
    ),
    introPrompt.system,
  )
  const intro=response.optimized_intro
  // 응답 데이터
  console.log("generateIntro 응답 데이터",JSON.stringify(response))
  return {
    intro:intro
  };
}
