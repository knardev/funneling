"use server";

import { Analysis, KeywordObj} from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { introPrompt } from "../../prompts/content/introPrompt";

export async function generateIntro(
    keyword: KeywordObj,
    title: string,
    toc:string,
    analysis?: Analysis,
) {
  console.log("keyword",keyword.keyword);
  console.log("subkeywords",keyword.subkeywords);
  console.log("title",title);
  console.log("toc",toc);

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
  return {
    intro:intro
  };
}
