"use server";

import { Analysis, KeywordObj } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { conclusionPrompt } from "../../prompts/content/conclusionprompt";  


export async function generateConclusion(
    keyword: KeywordObj,
    title: string,
    toc:string,
    intro:string,
    body:string,
    analysis?: Analysis
) {
    console.log("body",body)
    const response=await makeClaudeRequest<{
        optimized_conclusion:string
    }>(
        conclusionPrompt.generatePrompt(
            keyword.keyword,
            keyword.subkeywords,
            title,
            toc,
            intro,
            body,
            analysis
        ),
        conclusionPrompt.system
    )
    const conclusion=await response.optimized_conclusion
  // 응답 데이터
  return {
    conclusion:conclusion
  };
}
