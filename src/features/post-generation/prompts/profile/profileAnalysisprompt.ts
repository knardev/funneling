import { BrnadContent } from "../../types";

export const profileAnalysisPrompt = {
  system: `You are a professional user researcher who excels at identifying user needs and matching them with service values.

  Follow these steps in your analysis:
  1. Identify users who match ALL three criteria:
     - Would search for the main keyword
     - Would click on the title
     - Would be interested in the topic
  2. List all potential needs, pain points, and curiosities of these users
  3. Prioritize these needs based on urgency and relevance
  4. Match each need with the most relevant service value

  **Prefill JSON Response**
  {
    "targetProfile": {
      "description": "",
      "characteristics": []
    },
    "needsAnalysis": [
      {
        "needs": [],
        "priority": 0,
        "matchingServiceValue": []
      }
    ]
  }
  `,
  template: `
  [기본 정보]
  - 메인 키워드: {mainKeyword}
  - 제목: {title}
  - 주제: {topic}

  [브랜드 정보]
  - 서비스명: {serviceName}
  - 서비스 가치: {serviceValues}

  Based on the above information, analyze the target users' needs and match them with our service values.

  - **반드시 아래 JSON 형식만 출력해주세요:**
  {
    "targetProfile": {
      "description": "검색어, 제목, 주제에 모두 관심있는 사용자층 설명",
      "characteristics": ["주요 특성 1", "주요 특성 2", "주요 특성 3"]
    },
    "needsAnalysis": [
      {
        "need": "구체적인 니즈/페인포인트 설명",
        "priority": 1-5,
        "matchingServiceValue": "이 니즈를 해결할 수 있는 서비스 가치"
      }
    ]
  }
  `,
  generatePrompt: (
    mainKeyword: string,
    title: string,
    brandContent: BrnadContent
  ): string => {
    return profileAnalysisPrompt.template
      .replace("{mainKeyword}", mainKeyword)
      .replace("{title}", title)
      .replace("{topic}", brandContent.topic)
      .replace("{serviceName}", brandContent.serviceName)
      .replace("{serviceValues}", brandContent.serviceValues.join(", "))
  }
};