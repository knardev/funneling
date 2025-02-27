"use server";

import { Analysis, Content } from "../../types";
import { imagepromptPrompt } from "../../prompts/image/imagepromptPrompt";
import { makeOpenAiRequest } from "../../utils/ai/openai";

export async function generateImagePrompt(
    content: Content,
    analysis?: Analysis,
) {
    const allcontent=`${content.intro}\n${content.body}\n${content.conclusion}`
    
    const response=await makeOpenAiRequest<{
        image_prompts:string,
        updatedContent:string
    }>(
        imagepromptPrompt.generatePrompt( 
            allcontent,
            analysis 
        ),
        imagepromptPrompt.system,
    )

    const promptArray = Object.entries(response.image_prompts).map(([id,prompt])=> ({
      id:id,
      prompt:prompt
    }))
    console.log("generateImagePrompt prompt", imagepromptPrompt.generatePrompt)
    const updatedContent=response.updatedContent
    console.log("generateImagePrompt 응답 데이터",updatedContent)
    console.log("generateImagePrompt 응답 데이터",promptArray)
  // 응답 데이터
  return {
    updatedContent:updatedContent,
    imagePrompts:promptArray
  };
  }
