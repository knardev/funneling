"use server";

import { tocPrompt } from "../../prompts/content/tocPrompt";
import { KeywordObj, Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";


export async function generateToc(
  keyword: KeywordObj,
  title: string,
  analysis: Analysis
)
{

  const response= makeClaudeRequest<{
    toc:string
  }>(
    tocPrompt.generatePrompt(
      KeywordObj.keyword,
      KeywordObj.subkeywords,    
      title
    ),
    tocPrompt.system
  )

 {
  // 응답 데이터
  return {
    toc:toc
}
 }
}