import { Analysis } from "../../types";

export const conclusionPrompt = {
    system: (includeConclusion2: boolean) => `
    You're a professional Blogger in Korea. Every sentence should be short,
    easy, and specific.

    **Prefill JSON Response**
                {
                "analysis_results": {
                    "Analysis": {
                        "message": "{제목, 서론, 목차, 본론 분석 내용}"
                    }
                },
                "optimized_conclusion1": "{결론1 내용}"${
                  includeConclusion2 ? `,
                "optimized_conclusion2": "{결론2 내용}"` : ""
                }
            }
    `,
    template: (includeConclusion2: boolean) => `
    \n\nHuman:
        ### 결론1 생성 프롬프트

        **Human:**  
        You're a professional Blogger in Korea. Please make a conclusion with the guide below.  
        다음 제목, 목차, 서론 및 본론을 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 결론을 작성해 주세요.  
        결론1은 독자가 읽고 공감하며, 글에서 얻은 핵심 내용을 요약하고, 실질적인 통찰이나 다음 행동을 제안할 수 있어야 합니다.  
        결론1은 독자가 글을 마무리하며 느낄 만족감을 극대화하도록 최적화합니다.  

        메인키워드: {mainKeyword}
        제목: "{title}"  
        목차: "{toc}"  
        서론: "{intro}"  
        본론: "{body}"  

        ### 작성 가이드

        **1. 제목, 서론 및 본론 분석**  
        제공된 제목, 서론, 본론에서 다음 세 가지를 분석하세요:  
        - 독자가 얻어야 할 가장 중요한 정보는 무엇인가?  
        - 본론에서 해결된 질문 또는 논의된 핵심 내용은 무엇인가?  
        - 결론1에서 독자에게 남겨야 할 메시지(예: 통찰, 영감, 행동 제안)는 무엇인가?  

        **2. 독자의 만족감과 기대 충족**  
        결론1에서는 독자가 글을 통해 얻은 통찰과 정보가 정리되었음을 느끼게 하세요.  
        글의 주제를 기반으로 한 명확한 메시지를 전달하며, 독자가 감정적으로 공감하거나 동기부여를 느낄 수 있는 표현을 사용하세요.

        **3. 결론 작성 가이드**  
        - 말투는 서론의 말투를 따라야 합니다.
        - **문장 간 줄바꿈을 통해 가독성을 높여야 합니다.**
        결론1은 다음 중 하나 또는 조합된 방식으로 작성합니다:  
        - **핵심 요약형**: 글의 주요 내용을 간결하고 명확하게 정리합니다.  
        - **동기 부여형**: 독자가 글의 내용을 실천할 수 있도록 격려하고 동기를 부여합니다.  
        - **행동 제안형**: 독자가 다음에 해야 할 행동이나 관련 자료를 구체적으로 제안합니다.  
        예: "이제 [특정 단계]를 시도해보세요." 또는 "자세한 내용은 [자료 링크]를 참고하세요."  

        "{serviceAnalysisInstruction}"

        ### 최종 출력 조건

        1. 결론1 내용은 하나의 텍스트로 연결된 흐름으로 작성해야 합니다.  
        2. JSON 형식의 키값 **optimized_conclusion** 안에 결론 전체 텍스트를 포함해야 합니다.  
        3. 반드시 아래 JSON 구조로만 출력하세요. JSON 외의 어떤 내용도 출력하지 말아야 합니다.


            \n\nAssistant:
            {
                "analysis_results": {
                    "Analysis": {
                        "message": "{제목, 서론, 목차, 본론 분석 내용}"
                    }
                },
                "optimized_conclusion1": "{결론1 내용}"${
                    includeConclusion2 ? `,
                "optimized_conclusion2": "{결론2 내용}"` : ""
                }
            }
    `,
    generatePrompt: (
      mainKeyword: string,
      title: string,
      toc: string,
      intro: string,
      body: string,
      analysis?: Analysis
    ): string => {
        const hasValidAnalysis = analysis !== undefined && Object.values(analysis).some(value => value !== undefined);

        const serviceAnalysisInstructions = hasValidAnalysis
          ? `
          5. 결론2 작성 조건
          - 결론1 이후 연결될 결론2는 사용자의 행동을 유도(링크 클릭,전화 연결)하는 내용입니다.
          - 결론2와 결론1은 자연스럽게 연결되어야 합니다.
          - 줄바꿈을 통해 가독성을 높여야 합니다.
          `
          : "";

        return conclusionPrompt.template(hasValidAnalysis)
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
          .replace("{body}", body)
          .replace("{serviceAnalysisInstruction}", serviceAnalysisInstructions)
          .replace("{analysis}", analysis ? JSON.stringify(analysis) : '');
    }
};
