"use server";

import { Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { updatedcontentPrompt } from "../../prompts/contentPrompt/updatedcontentprompt";

export async function generateUpdatedContent(
    mainkeyword: string,
    title: string,
    toc: string,
    intro: string,
    body: string,
    conclusion: string,
    analysis?: Analysis | null
) {


    // analysis 유효성 확인
    const hasValidAnalysis = Boolean(analysis && Object.values(analysis).some(value => value !== null));

    // 생성된 system 메시지 확인
    const systemMessage = updatedcontentPrompt.system;

    // 생성된 프롬프트 확인
    const promptMessage = updatedcontentPrompt.generatePrompt(mainkeyword, title, toc, intro, body,conclusion, analysis);
    console.log(promptMessage);

    // Claude API 요청 및 응답
    const response = await makeClaudeRequest<{
        updated_content: string;
    }>(promptMessage, systemMessage);
    console.log(response);
    return {
        updated_content: response.updated_content,
    };
}
