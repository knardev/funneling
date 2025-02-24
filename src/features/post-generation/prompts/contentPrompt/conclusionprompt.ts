import { Analysis, AnalysisResults, BrnadContent } from "../../types";

export const conclusionPrompt = {
  system: `
    당신은 한국에서 활동하는 전문 블로거입니다. 모든 문장은 짧고 명확하며 구체적으로 작성되어야 합니다.

    **사전 채워진 JSON 응답**
    {
      "analysis_results": {
        "Analysis": {
          "message": "{제목, 서론, 목차, 본론 분석 내용}"
        }
      },
      "optimized_conclusion1": "{결론 내용}"
    }
  `,
  template1: `


Human:
### 결론 생성 프롬프트

**Human:**  
제목, 목차, 서론, 본문을 기반으로 핵심 인사이트를 요약하고, 독자가 행동할 수 있도록 명확하고 강력한 결론을 작성해주세요.  
결론은 서론과 본문의 핵심 내용을 효과적으로 요약하며, 독자가 만족감을 느낄 수 있도록 최적화되어야 합니다.

메인 키워드: {mainKeyword}  
제목: "{title}"  
목차: "{toc}"  
서론: "{intro}"  
본문: "{body}"  

### 작성 가이드

1. 서론과 본문의 핵심 내용을 요약하세요.
2. 독자가 다음 단계로 행동할 수 있도록 명확한 메시지로 마무리하세요.
3. 짧고 간결한 문장을 사용하세요.
4. 가독성을 위해 줄 바꿈(\n)을 사용하세요.
5. **결론의 말투는 서론,본론의 말투를 따릅니다.**

### 최종 출력 조건

- 결론 내용은 **optimized_conclusion1** 키 내에 포함되어야 합니다.
- 모든 줄 바꿈과 탭은 이스케이프(예: \n) 처리해야 합니다.
- 반드시 아래 JSON 형식으로 출력해야 합니다:


Assistant:
{
  "analysis_results": {
    "Analysis": {
      "message": "{제목, 서론, 목차, 본론 분석 내용}"
    }
  },
  "optimized_conclusion1": "{결론 내용}"
}
  `,
  template2: `


Human:
### 결론 생성 프롬프트

**Human:**  
제목, 목차, 서론, 본문, 추가 브랜드 정보 및 분석 데이터를 활용하여 핵심 인사이트를 담은 결론을 작성해주세요.  
결론은 서론과 본문의 핵심 내용을 강조하며, 독자가 신뢰할 수 있도록 브랜드의 강점을 자연스럽게 녹여야 합니다.  
마지막에는 독자가 즉시 실행할 수 있는 강력한 행동 유도 메시지를 포함해주세요.  
문장은 짧고 명확해야 합니다.

메인 키워드: {mainKeyword}  
제목: "{title}"  
주제: "{topic}"  
목차: "{toc}"  
서론: "{intro}"  
본문: "{body}"  
서비스명: "{serviceName}"  
서비스 가치: "{serviceValues}"  
서비스 분석: {analysis}

### 작성 가이드

1. 서론과 본문의 핵심 내용을 요약하면서, 의사결정에 영향을 미치는 주요 요소를 강조하세요.
2. 브랜드의 주제와 서비스 가치를 자연스럽게 통합하여 신뢰도를 높이세요.
3. 신중하고 정보에 기반한 결정이 중요함을 강조하며, 브랜드의 장점과 차별성을 부각하세요.
4. 독자가 다음 단계로 나아갈 수 있도록 명확하고 강력한 행동 유도 메시지를 포함하세요.
5. 짧고 간결한 문장을 사용하세요.
6. 가독성을 위해 줄 바꿈(\n)을 사용하세요.
7. **결론의 말투는 서론,본론의 말투를 따릅니다.**

### 최종 출력 조건

- 결론 내용은 **optimized_conclusion1** 키 내에 포함되어야 합니다.
- 모든 줄 바꿈과 탭은 이스케이프(예: \n) 처리해야 합니다.
- 반드시 아래 JSON 형식으로 출력해야 합니다:


Assistant:
{
  "analysis_results": {
    "Analysis": {
      "message": "{제목, 서론, 목차, 본론 분석 내용}"
    }
  },
  "optimized_conclusion1": "{결론 내용}"
}
  `,
  generatePrompt: (
    mainKeyword: string,
    title: string,
    toc: string,
    intro: string,
    body: string,
    tone: string,
    brandContent?: BrnadContent,
    analysis?: AnalysisResults[]
  ): string => {
    if (brandContent && analysis) {
      return conclusionPrompt.template2
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{topic}", brandContent.topic)
        .replace("{toc}", toc)
        .replace("{intro}", intro)
        .replace("{body}", body)
        .replace("{serviceName}", brandContent.serviceName)
        .replace("{serviceValues}", brandContent.serviceValues.join(", "))
        .replace("{analysis}", JSON.stringify(analysis));
    } else {
      return conclusionPrompt.template1
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
        .replace("{intro}", intro)
        .replace("{body}", body);
    }
  }
};
