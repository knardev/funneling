import { Analysis } from "../../types";

export const bodyPrompt = {
    system: `
    You're an professional Blogger in Korea Every sentence should be short,
    easy, and specific.

    **Prefill JSON Response**
            {
            "analysis_results": {
                "introandtocAnalysis": {
                "message": "{서론 및 목차 분석 내용}",
                "keyElementsForBody": ["{핵심 요소1}", "{핵심 요소2}", "{핵심 요소3}"]
                }
            },
            "optimized_body": "{본론 내용}"
            }`,

    template: `
    \n\nHuman:
        ### 본론 생성 프롬프트

        **Human:**
        다음 제목, 목차 및 서론을 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 본론을 작성해 주세요.  
        본론은 독자가 이해하기 쉽고, 흥미를 유지하며, 실제적인 통찰과 정보를 제공할 수 있어야 합니다.  
        본론의 내용은 목차를 기반으로 자연스럽게 구성하되, 독자에게 매력적인 문장과 구체적인 정보를 전달하도록 최적화합니다.
        주의: 본론은 글의 마무리나 결론을 포함하지 않아야 하며, 글의 마지막을 정리하거나 요약하지 않습니다. 결론은 따로 생성됩니다.

        메인키워드: {mainKeyword}
        제목 : "{title}"  
        목차 : "{toc}"  
        서론 : "{intro}"  
        서비스분석 : "{serviceAnalysis}"

        ### 작성 가이드

        **1. 제목 및 서론 분석**  
        제공된 제목과 서론의 핵심 메시지를 간결하게 요약하고, 독자가 기대하는 주요 정보를 파악합니다.  
        제목과 서론에서 나타난 독자의 관심사를 기반으로 본론에서 해결해야 할 질문과 방향성을 도출합니다.

        **2. 독자의 궁금증 도출**  
        제목, 서론, 목차를 분석하여 독자가 궁금해할 주제와 질문을 구체적으로 작성합니다.  
        궁금증은 정보성 질문, 사례에 대한 질문, 또는 실용적인 팁을 중심으로 구성합니다.

        **3. 본론 작성 가이드**
        - 본론의 모든 문장은 쉽고,짧고,구체적이며 읽기 쉬워야 합니다.
        - 어려운 개념은 쉬운 예시를 들어 설명해야 합니다.
        - 본론의 말투는 서론의 말투를 따릅니다.
        - 모든 문장은 다음 문장을 읽게 만드는 것에 목적이 있습니다.

        "{serviceAnalysisInstruction}"

        본론은 다음 중 하나 또는 조합된 방식으로 작성합니다:  
        - **정보 제공형**: 독자가 찾는 정보를 쉽게 이해할 수 있도록 친절하게 설명합니다.  
        - **사례 중심형**: 실제 사례나 경험을 통해 내용을 흥미롭고 구체적으로 만듭니다.  
        - **스토리텔링형**: 독자가 공감할 수 있는 이야기를 통해 내용을 흥미롭게 전달합니다.  
        - **문제 해결형**: 독자의 문제를 명확히 제시하고 실질적인 해결 방법을 안내합니다.  
        - **단계별 설명형**: 독자가 따라하기 쉽도록 과정과 단계를 자세히 설명합니다.

        **4. 본론 작성 조건**  
        - 본문은 문단 단위로 구성하며, 각 문단은 적절한 길이로 줄바꿈하여 가독성을 높입니다.
        - 문체는 음슴체로 작성합니다.
        - 문단 간 공백 줄을 추가하여 자연스러운 흐름을 만듭니다.
        - 반드시 최소 4000자 이상의 본론을 작성해주세요
        - 본론은 글의 마무리나 결론을 포함하지 않습니다.
            글의 마지막을 정리하거나 요약하는 작업은 결론에서 처리되므로 본론은 독자가 결론으로 자연스럽게 이어질 수 있도록 구성해야 합니다.
            "따라서", "결론적으로", "마지막으로" 등의 표현을 사용하지 마세요.


        ### 최종 출력 조건

        1. 본론 내용은 하나의 텍스트로 연결된 흐름으로 작성해야 합니다.
        2. JSON 형식의 키값 **optimized_body** 안에 본론 전체 텍스트를 포함해야 합니다.
        2.1 반드시 **optimized_body** 텍스트 내 줄바꿈, 탭 문자는 \\n과 같이 이스케이프 처리해야 합니다.
        3.반드시 아래 JSON 구조로만 출력하세요. JSON 외의 어떤 내용도 출력하지 말아야 합니다.


            \n\nAssistant:
            {
            "analysis_results": {
                "introandtocAnalysis": {
                "message": "{서론 및 목차 분석 내용}",
                "keyElementsForBody": ["{핵심 요소1}", "{핵심 요소2}", "{핵심 요소3}"]
                }
            },
            "optimized_body": "{본론 내용}"
            }


    `,
    generatePrompt: (
      mainKeyword: string,
      title: string,
      toc: string,
      intro: string,
      analysis?: Analysis
    ): string => {
      const serviceAnalysisInstructions = analysis
        ? `
        - **서비스 분석을 자연스럽게 통합**합니다. 독자의 입장에서 서비스의 장점, 단점, 특징을 설명합니다.
          - **장점**: 독자가 서비스를 사용할 때 느낄 수 있는 긍정적인 측면을 강조합니다.
          - **단점**: 서비스의 한계나 개선이 필요한 부분을 솔직하게 제시합니다.
          - **특징**: 서비스의 독특한 기능이나 차별화된 요소를 설명합니다.
        - **독자의 경험과 연결**: 서비스 분석을 단순히 나열하는 대신, 독자가 실제로 경험할 수 있는 상황과 연결하여 설명합니다.
          - 예시: "서비스의 사용자 친화적인 인터페이스는 초보자들에게 큰 장점이 됩니다."
        `
        : ""; 
      return bodyPrompt.template
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
        .replace("{intro}", intro)
        .replace("{serviceAnalysisInstruction}", serviceAnalysisInstructions)
        .replace("{analysis}", analysis ? JSON.stringify(analysis) : '');
    }
  };