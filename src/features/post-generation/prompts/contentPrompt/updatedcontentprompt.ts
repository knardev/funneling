import { Analysis } from "../../types";

export const updatedcontentPrompt = {
    system: `
    당신은 한국의 전문 블로거입니다.  
    모든 문장은 짧고, 이해하기 쉬우며, 명확해야 합니다.  
    
    **Prefill JSON Response**  
    {
        "updated_content": ""
    }
    `,
    template: `
    ### 최종 컨텐츠 생성 프롬프트

            **입력 요소:**  
            - 메인키워드: {mainKeyword}  
            - 제목: "{title}"  
            - 목차: "{toc}"  
            - 서론: "{intro}"  
            - 본론: "{body}"  
            - 결론: "{conclusion}"  

            ### 최종 출력 조건

            1. **가독성 향상**  
            - 각 섹션(목차, 서론, 본론, 결론)을 명확히 구분합니다.  
            - 각 섹션은 제목과 본문이 줄바꿈을 통해 명확히 나뉘어야 합니다.  
            - 각 문단은 빈 줄(\n)로 나뉘어야 합니다.  
            - 가독성을 높이기 위해 각 섹션과 문단 사이에는 반드시 빈 줄(\n)을 추가합니다.

            2. **문장 구조 최적화**  
            - 각 문장은 짧고 명확하게 작성해야 합니다.  
            - 불필요한 반복을 피하고 핵심 내용을 중심으로 서술합니다.

            3. **목차와 일치**  
            - 본문의 내용은 목차에 따라 구조화됩니다.  
            - 각 섹션은 목차의 순서를 따르며 일관된 형식을 유지합니다.

            4. **JSON 구조 유지**  
            - 반드시 아래 JSON 구조로만 출력합니다.  
            - JSON 외의 어떤 내용도 출력하지 않아야 합니다.  
            - updated_content 키에는 줄바꿈(\n)과 공백( )이 명확히 포함된 최종 완성된 콘텐츠가 하나의 문자열로 포함됩니다.


            5. **형식 예시**  
            {
                "updated_content": "제목\n\n서론\n\n(내용)\n\n본론\n\n(내용)\n\n결론\n\n(내용)"
            }

            ### 핵심 요구사항  
            - **명확성**: 문장은 짧고 명확해야 합니다.  
            - **구조 유지**: 목차, 서론, 본론, 결론 순서를 유지합니다.  
            - **가독성**: 줄바꿈과 문단 나눔을 통해 읽기 편하게 구성합니다.  
            - **JSON 형식 준수**: "updated_content"에 최종 콘텐츠가 정확하게 포함됩니다.  
    `,
    generatePrompt: (
      mainKeyword: string,
      title: string,
      toc: string,
      intro: string,
      body: string,
      conclusion: string,
      analysis?: Analysis | null
    ): string => {

        return updatedcontentPrompt.template
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
          .replace("{body}", body)
          .replace("{conclusion}", conclusion)
          .replace("{analysis}", analysis ? JSON.stringify(analysis) : '');
    }
};
