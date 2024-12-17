"use server";

import { Analysis, Content } from "../../types";
import { imagepromptPrompt, imagepromptPromptSchema } from "../../prompts/image/imagepromptPrompt";
import { makeOpenAiRequest } from "../../utils/ai/openai";

export async function generateImagePrompt(
    content: Content,
    analysis?: Analysis,
) {
    const allcontent=`${content.title}\n${content.toc}\n${content.intro}\n${content.body}\n${content.conclusion}`
    
    const response=await makeOpenAiRequest<{
        image_prompts:string,
        updatedContent:string
    }>(
        imagepromptPrompt.generatePrompt( 
            allcontent,
            analysis 
        ),
        imagepromptPrompt.system,
        imagepromptPromptSchema
    )

    const promptArray = Object.entries(response.image_prompts).map(([id,prompt])=> ({
      id:id,
      prompt:prompt
    }))
    const updatedContent=response.updatedContent

    console.log("generateImagePrompt 응답 데이터",promptArray)
  // 응답 데이터
  return {
    updatedContent:updatedContent,
    imagePrompts:promptArray
  };
  }
