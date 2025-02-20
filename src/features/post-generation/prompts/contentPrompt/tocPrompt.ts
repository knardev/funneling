import { AnalysisResults, BrnadContent } from "../../types";

export const tocPrompt = {
  system: `You are a professional content strategist who understands user search intent and information needs.

  **Prefill JSON Response**
  {
    "toc": []
  }
  `,
  // 템플릿 1: mainKeyword, title만 있을 때
  template1: `
  제목 "{title}"에 대한 실용적이고 체계적인 목차를 작성해주세요. *각 목차는 쉽고, 짧고, 구체적으로 작성되어야 합니다.*

  [기본 정보]
  - 메인 키워드: {mainKeyword}

      [목차 작성 방향]
      주제의 성격을 파악하여 아래 두 가지 방식 중 더 적합한 형태로 목차를 구성해주세요:
      1. 단계별 가이드: 실습, 학습, 프로세스 등 순차적 실행이 필요한 내용
      2. 주제별 분석: 개념 설명, 현상 분석, 비교 검토가 필요한 내용

  [목차 작성 원칙]
  - 전체 흐름을 명확하게 제시하여, 글의 구조와 전개 방향을 한눈에 파악할 수 있도록 할 것
  - 문제 제기 및 해결의 단계를 구분하여, 독자가 고민과 해결책을 명확히 인지할 수 있도록 구성할 것
  - 브랜드의 강점과 차별화된 가치를 반영하여, 독자의 궁금증과 고민을 효과적으로 해결하는 내용을 포함할 것
  - 독자의 호기심을 자극할 수 있도록 질문형 문구나 핵심 키워드를 적절히 배치할 것
  - 5개 이내의 대주제로 제한하여 핵심 정보에 집중할 것
  - **반드시 아래 JSON 형식만 출력해주세요:**
  {
    "toc": [
      "1. 첫 번째 주제",
      "2. 두 번째 주제",
      "3. 세 번째 주제",
      "4. 네 번째 주제",
      "5. 다섯 번째 주제"
    ]
  }
  `,
  // 템플릿 2: brandContent와 analysis도 있을 때 (기존 프롬프트 대비 수정됨)
  template2: `
  제목 "{title}"에 대한 실용적이고 체계적인 목차를 작성해주세요. *각 목차는 쉽고, 짧고, 구체적으로 작성되어야 합니다.*

  [기본 정보]
  - 메인 키워드: {mainKeyword}

  [브랜드 정보]
  - 서비스명: {serviceName}
  - 주제: {topic}
  - 서비스 가치: {serviceValues}

  [분석 결과]
  {serviceAnalysis}

  [목차 작성 방향]
  주제의 성격과 브랜드의 강점을 반영하여 아래 두 가지 방식 중 더 적합한 형태로 목차를 구성해주세요:
  1. 단계별 가이드: 실습, 학습, 프로세스 등 순차적 실행이 필요한 내용
  2. 주제별 분석: 개념 설명, 현상 분석, 비교 검토가 필요한 내용

  [목차 작성 원칙]
  - 전체 흐름을 명확하게 제시하여 글의 구조와 전개 방향을 한눈에 파악할 수 있도록 구성할 것
  - 문제 제기 및 해결 단계를 명확히 구분하여, 독자가 고민과 그 해결책을 쉽게 이해할 수 있도록 할 것
  - 브랜드의 강점과 차별화된 가치를 자연스럽게 녹여내어, 독자의 실제 궁금증과 고민을 해결하는 데 초점을 맞출 것
  - 독자의 호기심을 자극하는 질문형 문구나 핵심 키워드를 포함하여, 읽는 이의 관심을 지속적으로 유도할 것
  - 5개 이내의 대주제로 제한하여 핵심 정보에 집중할 것
  - **반드시 아래 JSON 형식만 출력해주세요:**
  {
    "toc": [
      "1. 첫 번째 주제",
      "2. 두 번째 주제",
      "3. 세 번째 주제",
      "4. 네 번째 주제",
      "5. 다섯 번째 주제"
    ]
  }
  `,
  generatePrompt: (
    mainKeyword: string,
    title: string,
    brandContent?: BrnadContent,
    analysis?: AnalysisResults[]
  ): string => {
    if (brandContent && analysis) {
      return tocPrompt.template2
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{serviceName}", brandContent.serviceName)
        .replace("{topic}", brandContent.topic)
        .replace("{serviceValues}", brandContent.serviceValues.join(", "))
        .replace(
          "{serviceAnalysis}",
          analysis.length > 0 ? JSON.stringify(analysis) : "없음"
        );
    } else {
      return tocPrompt.template1
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{serviceAnalysis}", "");
    }
  }
};
