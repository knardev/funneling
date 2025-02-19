import { Analysis, AnalysisResults, BrnadContent } from "../../types"; 

export const conclusionPrompt = {
  // 시스템 프롬프트는 결론2 포함 여부에 따라 동적으로 생성됩니다.
  system: (includeExtended: boolean) => `
    You're a professional Blogger in Korea. Every sentence should be short, easy, and specific.

    **Prefill JSON Response**
    {
      "analysis_results": {
        "Analysis": {
          "message": "{제목, 서론, 목차, 본론 분석 내용}"
        }
      },
      "optimized_conclusion1": "{결론1 내용}"${ includeExtended ? `,
      "optimized_conclusion2": "{결론2 내용}"` : "" }
    }
  `,
  // 템플릿 1: brandContent와 analysis가 없는 기본 상황
  template1: `
\n\nHuman:
### 결론1 생성 프롬프트

**Human:**  
You're a professional Blogger in Korea. Please create a conclusion (Conclusion1) following the guide below.
Based on the provided title, table of contents, introduction, and body, write a conclusion that summarizes the key insights, leaves the reader with a clear takeaway, and suggests a next action.
Conclusion1 should be written in 음슴체 and optimized to maximize the reader's satisfaction.

Main Keyword: {mainKeyword}  
Title: "{title}"  
Table of Contents: "{toc}"  
Introduction: "{intro}"  
Body: "{body}"  

### Writing Guide

1. **Analysis of Title, Introduction, and Body**  
   - Summarize the key message conveyed by the title, introduction, and body.  
   - Identify the most important insights or resolved questions.

2. **Reader Satisfaction**  
   - Ensure the conclusion leaves a sense of completeness and provides clear insights or actionable suggestions.

3. **Conclusion Writing Guide**  
   - Write in short, simple, and specific sentences using 음슴체.  
   - Do NOT include phrases that summarize or wrap up the text (e.g., "따라서", "결론적으로").  
   - Use line breaks (escaped as \\n) for readability.


### Final Output Conditions

- The entire conclusion text should be contained in the JSON key **optimized_conclusion1** (and **optimized_conclusion2** if applicable).  
- All line breaks and tabs must be escaped (e.g., \\n).  
- Output must be in the following JSON structure only:

\n\nAssistant:
{
  "analysis_results": {
    "Analysis": {
      "message": "{제목, 서론, 목차, 본론 분석 내용}"
    }
  },
  "optimized_conclusion1": "{결론1 내용}"${''}
}
  `,
  // 템플릿 2: brandContent와 analysis가 제공되는 경우 (추가 정보 반영)
  template2: `
\n\nHuman:
### 결론 생성 프롬프트

**Human:**  
You're a professional Blogger in Korea. Using the provided title, table of contents, introduction, body, and additional brand information and analysis, create a conclusion that not only summarizes the key insights but also integrates the brand's topic and service values.
Write Conclusion1 so that it reflects the unique strengths of the brand, and then (if applicable) produce Conclusion2 that motivates the reader to take action (e.g., click a link or call).
Both conclusions must be written in 음슴체 and connected naturally.

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

1. **Analysis of Title, Topic, Introduction, and Body**  
   - Simplify and analyze the key messages from the title, topic, introduction, and body.  
   - Consider the brand's unique service values and differentiate its strengths.  
   - Identify 2-3 key insights or questions that the reader might have.

2. **Extended Conclusion Instructions**  
   - Conclusion1 should summarize the main insights and leave a satisfying message.  
   - If applicable, Conclusion2 should naturally follow and encourage the reader to take a specific action.
   - Use the brand's topic and service values to enhance the message.

"${"{serviceAnalysisInstruction}"}"

### Final Output Conditions

- The complete conclusion text should be contained in the JSON keys **optimized_conclusion1** and **optimized_conclusion2** (if applicable).  
- All line breaks and tabs must be escaped (e.g., \\n).  
- Output must be in the following JSON structure only:

\n\nAssistant:
{
  "analysis_results": {
    "Analysis": {
      "message": "{제목, 서론, 목차, 본론 분석 내용}"
    }
  },
  "optimized_conclusion1": "{결론1 내용}"${''}${''}
  ${''}
  ${''}
  ${''}
  ${''}
  ${''}
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
    // 기본 상황: brandContent와 analysis 미제공 시
    if (brandContent && analysis) {
        // 상황 2: brandContent와 analysis가 모두 제공될 때
        return conclusionPrompt.template2
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{topic}", brandContent.topic)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
          .replace("{body}", body)
          .replace("{serviceName}", brandContent.serviceName)
          .replace("{serviceValues}", brandContent.serviceValues.join(", "))
          .replace("{serviceAnalysis}", JSON.stringify(analysis))
      } else {
        // 상황 1: brandContent와 analysis가 없는 경우
        return conclusionPrompt.template1
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
          .replace("{body}", body)
      }
    }
  };