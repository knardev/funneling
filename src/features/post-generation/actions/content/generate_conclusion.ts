"use server";

import { Analysis, KeywordObj } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { conclusionPrompt } from "../../prompts/contentPrompt/conclusionprompt";  


export async function generateConclusion(
    mainkeyword: string,
    subkeywords: string[],
    title: string,
    toc:string,
    intro:string,
    body:string,
    analysis?: Analysis
) {
    const response=await makeClaudeRequest<{
        optimized_conclusion1:string,
        optimized_conclusion2:string
    }>(
        conclusionPrompt.generatePrompt(
            mainkeyword,
            subkeywords,
            title,
            toc,
            intro,
            body,
            analysis
        ),
        conclusionPrompt.system
    )
    const conclusion1=await response.optimized_conclusion1
    const conclusion2=await response.optimized_conclusion2

    const conclusion = conclusion1+conclusion2
  // 응답 데이터
  console.log("generateConclusion 응답 데이터",JSON.stringify(response))
  return {
    conclusion:conclusion
  };
}
