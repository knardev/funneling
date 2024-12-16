"use server";
import { Analysis, KeywordObj, Persona } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { bodyPrompt } from "../../prompts/contentPrompt/bodyPrompt";

export async function generateBody(
  mainkeyword: string,
  subkeywords: string[],
  title: string,
  toc:string,
  intro:string,
  analysis?: Analysis) {
    

    const response=await makeClaudeRequest<{
        optimized_body:string
    }>(
        bodyPrompt.generatePrompt(
            mainkeyword,
            subkeywords,
            title,
            toc,
            intro,
            analysis
        ),
        bodyPrompt.system
    ) 

    const body=await response.optimized_body
console.log("generateBody 응답 데이터",JSON.stringify(response))
  // 응답 데이터
  return {
    body:body
  };
}
