"use server";

import { Analysis } from "../../types";
import { makeClaudeRequest } from "../../utils/ai/claude";
import { conclusionPrompt } from "../../prompts/contentPrompt/conclusionprompt";

export async function generateConclusion(
    mainkeyword: string,
    title: string,
    toc: string,
    intro: string,
    body: string,
    analysis?: Analysis
) {


    // analysis 유효성 확인
    const hasValidAnalysis = Boolean(analysis && Object.values(analysis).some(value => value !== null));

    // 생성된 system 메시지 확인
    const systemMessage = conclusionPrompt.system(hasValidAnalysis);

    // 생성된 프롬프트 확인
    const promptMessage = conclusionPrompt.generatePrompt(mainkeyword, title, toc, intro, body, analysis);

    // Claude API 요청 및 응답
    const response = await makeClaudeRequest<{
        optimized_conclusion1: string;
        optimized_conclusion2: string;
    }>(promptMessage, systemMessage);


    // 결론1, 결론2 확인
    const conclusion1 = response.optimized_conclusion1;
    const conclusion2 = hasValidAnalysis ? response.optimized_conclusion2 : null;


    // 최종 결론
    const conclusion = conclusion2 ? `${conclusion1} ${conclusion2}` : conclusion1;
    console.log("Final conclusion:", conclusion);

    return {
        conclusion: conclusion,
    };
}
