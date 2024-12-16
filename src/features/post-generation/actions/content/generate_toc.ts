"use server";

import { tocPrompt } from "../../prompts/contentPrompt/tocPrompt";
import { KeywordObj, Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";


export async function generateToc(
  mainkeyword: string,
  subkeywords: string[],
  title: string,
  analysis?: Analysis
)
{
console.log(mainkeyword)
console.log(subkeywords)
console.log(title)
  const response= await makeClaudeRequest<{
    toc:string
  }>(
    tocPrompt.generatePrompt(
      mainkeyword,
      subkeywords,    
      title,
      analysis
    ),
    tocPrompt.system
  )

  const toc= response.toc
  console.log("generateToc 응답 데이터",response)
 {
  // 응답 데이터
  return {
    toc:toc
  }
 }
}