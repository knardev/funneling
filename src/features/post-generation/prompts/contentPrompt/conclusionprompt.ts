import { Analysis, AnalysisResults, BrnadContent } from "../../types";

export const conclusionPrompt = {
  // 시스템 프롬프트는 결론2 포함 여부에 상관없이 동일하게 설정합니다.
  system: `
    You're a professional Blogger in Korea. Every sentence should be short, easy, and specific.

    **Prefill JSON Response**
    {
      "analysis_results": {
        "Analysis": {
          "message": "{제목, 서론, 목차, 본론 분석 내용}"
        }
      },
      "optimized_conclusion1": "{결론 내용}"
    }
  `,
  // 템플릿 1: 브랜드 정보와 분석 데이터가 없는 경우
  template1: `
\n\nHuman:
### 결론 생성 프롬프트

**Human:**  
Based on the provided title, table of contents, introduction, and body, please create a conclusion that effectively summarizes the key insights from the introduction and body, and concludes with a clear, motivating call-to-action.
The conclusion should be written in 음슴체 and optimized to provide a satisfying wrap-up for the reader.

Main Keyword: {mainKeyword}  
Title: "{title}"  
Table of Contents: "{toc}"  
Introduction: "{intro}"  
Body: "{body}"  

### Writing Guide

1. Summarize the key insights from the introduction and body.
2. Conclude with a clear call-to-action that encourages the reader to take a next step.
3. Write in short, simple, and specific sentences using 음슴체.
4. Use line breaks (escaped as \\n) for readability.

### Final Output Conditions

- The conclusion text should be contained in the JSON key **optimized_conclusion1**.
- All line breaks and tabs must be escaped (e.g., \\n).
- Output must be in the following JSON structure only:

\n\nAssistant:
{
  "analysis_results": {
    "Analysis": {
      "message": "{제목, 서론, 목차, 본론 분석 내용}"
    }
  },
  "optimized_conclusion1": "{결론 내용}"
}
  `,
  // 템플릿 2: 브랜드 정보와 분석 데이터가 제공되는 경우
  template2: `
\n\nHuman:
### 결론 생성 프롬프트

**Human:**  
Using the provided title, table of contents, introduction, body, and additional brand information and analysis, please create a conclusion that summarizes the key insights from the introduction and body and finishes with a compelling call-to-action.
The conclusion should naturally integrate the brand's topic and service values to reinforce its unique strengths, and be written in 음슴체.

Main Keyword: {mainKeyword}  
Title: "{title}"  
Topic: "{topic}"  
Table of Contents: "{toc}"  
Introduction: "{intro}"  
Body: "{body}"  
Service Name: "{serviceName}"  
Service Values: "{serviceValues}"  
Service Analysis: {analysis}

### Writing Guide

1. Summarize the key insights from the introduction and body.
2. Integrate the brand's topic and service values to reinforce its unique strengths.
3. Conclude with a clear, compelling call-to-action that motivates the reader to take a specific next step.
4. Write in short, simple, and specific sentences using 음슴체.
5. Use line breaks (escaped as \\n) for readability.

### Final Output Conditions

- The conclusion text should be contained in the JSON key **optimized_conclusion1**.
- All line breaks and tabs must be escaped (e.g., \\n).
- Output must be in the following JSON structure only:

\n\nAssistant:
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
