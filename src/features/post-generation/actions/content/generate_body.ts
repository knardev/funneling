"use server";
import { Analysis, KeywordObj, Persona } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { bodyPrompt } from "../../prompts/content/bodyPrompt";

export async function generateBody(
  keyword: KeywordObj,
  title: string,
  toc:string,
  intro:string,
  analysis?: Analysis) {
    
    console.log("intro",intro)


    const response=await makeClaudeRequest<{
        optimized_body:string
    }>(
        bodyPrompt.generatePrompt(
            keyword.keyword,
            keyword.subkeywords,
            title,
            toc,
            intro,
            analysis
        ),
        bodyPrompt.system
    ) 

    const body=await response.optimized_body

  // 응답 데이터
  return {
    body:body
  };
}
