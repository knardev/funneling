import { Analysis, AnalysisResults, BrnadContent } from "../../types";

export const bodyPrompt = {
  system: `
    You're an professional Blogger in Korea. Every sentence should be short, easy, and specific.

    **Prefill JSON Response**
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
  // 템플릿 1: brandContent와 analysis가 없는 기본 상황
  template1: `
\n\nHuman:
### 본론 생성 프롬프트

**Human:**
다음 제목, 목차 및 서론을 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 본론을 작성해 주세요.  
본론은 독자가 이해하기 쉽고, 흥미를 유지하며, 실제적인 통찰과 정보를 제공할 수 있어야 합니다.  
본문은 목차를 기반으로 자연스럽게 구성되며, 독자에게 매력적인 문장과 구체적인 정보를 전달하도록 최적화합니다.  
주의: 본론은 글의 마무리나 결론을 포함하지 않아야 하며, 글의 마지막을 정리하거나 요약하지 않습니다. (결론은 따로 생성됩니다.)  
**반드시 최소 4000자 이상의 본문을 작성할 것**

메인키워드: {mainKeyword}  
제목: "{title}"  
목차: "{toc}"  
서론: "{intro}"  

### 작성 가이드

1. **제목 및 서론 분석**  
   - 제공된 제목과 서론의 핵심 메시지를 간결하게 요약하고, 독자가 기대하는 주요 정보 및 질문, 방향성을 도출합니다.

2. **독자의 궁금증 도출**  
   - 제목, 서론, 목차를 분석하여 독자가 궁금해할 주제와 질문을 구체적으로 작성합니다.  
   - 정보성 질문, 사례나 팁 중심으로 구성합니다.

3. **본론 작성 가이드**  
   - 모든 문장은 쉽고, 짧고, 구체적이며 읽기 쉽도록 작성합니다.  
   - 어려운 개념은 쉬운 예시와 함께 설명합니다.  
   - 본론의 말투는 서론의 말투를 따르며, 각 문단은 자연스럽게 연결되어 독자가 다음 문장을 읽도록 유도합니다.

4. **최종 출력 조건**  
   - 본문은 하나의 텍스트로 연결된 흐름으로 작성되어 JSON의 **optimized_body** 키 안에 포함되어야 하며, 모든 줄바꿈 및 탭 문자는 \\n 등의 이스케이프 처리되어야 합니다.  
   - 반드시 아래 JSON 구조로만 출력할 것:
  
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
  // 템플릿 2: brandContent와 analysis가 제공되는 경우 (추가 정보 반영)
  template2: `
\n\nHuman:
### 본론 생성 프롬프트

**Human:**
다음 제목, 목차, 서론, 그리고 브랜드 정보 및 분석 데이터를 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 본론을 작성해 주세요.  
본론은 단순 정보 제공을 넘어, 먼저 문제(Problem)를 제기하여 독자의 공감을 유도하고, 이어서 브랜드의 서비스 가치(서비스명과 서비스 가치)를 자연스럽게 활용하여 해당 문제의 해결책(Solution)을 제시해야 합니다. 즉, 문제를 환기한 후 친근감(Affinity)을 형성하고, 서비스 가치를 통한 해결책을 제안(Ofeer)하며, 내용을 제한(Narrosing down)한 후, 독자가 구체적인 행동(Action)을 취하도록 유도하는 흐름을 따라야 합니다.  
본문은 목차를 기반으로 자연스럽게 구성되며, 브랜드의 주제와 서비스 가치를 효과적으로 반영하여 독자에게 매력적인 문장과 구체적인 정보를 전달하도록 최적화합니다.  
주의: 본론은 글의 마무리나 결론을 포함하지 않으며, 결론은 별도로 생성됩니다.  
**반드시 최소 4000자 이상의 본문을 작성할 것**

메인키워드: {mainKeyword}  
제목: "{title}"  
주제: "{topic}"  
서비스명: "{serviceName}"  
서비스 가치: "{serviceValues}"  
서비스분석: {serviceAnalysis}  
목차: "{toc}"  
서론: "{intro}"  

### 작성 가이드

1. **제목, 주제, 서론 및 목차 분석**  
   - 제목과 주제가 전달하는 핵심 메시지 및 목차의 흐름을 간결하게 분석합니다.  
   - 브랜드의 서비스 가치와 차별점을 고려하여 독자가 얻을 핵심 인사이트를 도출합니다.  
   - 독자의 주요 궁금증이나 니즈 2-3개를 도출하고, 감정적 연결과 신뢰성을 확인합니다.

2. **YES-SET 구성 및 Writing Flow**  
   아래 순서대로 글을 전개할 것:
   - **Problem (문제 제기):** 서비스분석의 정보를 활용하여 문제를 명확하게 제시하고 독자의 니즈를 자극합니다.
   - **Affinity (친근감):** 독자가 공감할 수 있도록 친근한 멘트로 문제에 대한 감정을 이끌어냅니다.
   - **Solution (해결책):** 브랜드의 서비스 가치를 자연스럽게 활용해 문제 해결 방안을 제시합니다.
   - **Ofeer (제안):** 구체적인 제안을 통해 독자가 실질적인 도움을 받을 수 있도록 안내합니다.
   - **Narrosing down (제한):** 내용을 한정하여 핵심 포인트를 부각시킵니다.
   - **Action (행동):** 독자가 구체적인 행동을 취하도록 유도하는 마무리 문장을 작성합니다.

3. **본론 작성 가이드**  
   - 모든 문장은 쉽고, 짧고, 구체적이며 읽기 쉽게 작성합니다.  
   - 실제 사례나 경험을 통해 내용을 구체적으로 설명합니다.  
   - 브랜드의 주제와 서비스 가치를 자연스럽게 녹여내어, 문제 제기를 통한 해결책을 효과적으로 전달합니다.

4. **최종 출력 조건**  
   - 본문은 하나의 텍스트로 연결된 흐름으로 작성되어 JSON의 **optimized_body** 키 안에 포함되어야 하며, 모든 줄바꿈 및 탭 문자는 \\n 등으로 이스케이프 처리되어야 합니다.  
   - 반드시 아래 JSON 구조로만 출력할 것:
  
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
    brandContent?: BrnadContent,
    analysis?: AnalysisResults[]
  ): string => {
    if (brandContent && analysis) {
      return bodyPrompt.template2
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{topic}", brandContent.topic)
        .replace("{toc}", toc)
        .replace("{intro}", intro)
        .replace("{serviceName}", brandContent.serviceName)
        .replace("{serviceValues}", brandContent.serviceValues.join(", "))
        .replace("{serviceAnalysis}", JSON.stringify(analysis));
    } else {
      return bodyPrompt.template1
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
        .replace("{intro}", intro);
    }
  }
};
