import { Analysis } from "../../types";

export const titlePrompt_test = {
  system: `You are a professional SEO expert who specializes in creating highly effective blog titles that highlight unique business value propositions.

    **Prefill JSON Response**
    {
      "analysis_results": {
        "keyword_structure": {
          "spacing_pattern": "주로 발견되는 띄어쓰기 패턴",
          "position_pattern": "주로 발견되는 위치",
          "average_length": {
            "syllables": "평균 음절 수",
            "characters": "평균 글자 수"
          }
        },
        "common_patterns": ["패턴1", "패턴2", "패턴3"],
        "keyword_combinations": ["조합1", "조합2", "조합3"]
      },
      "selected_subkeywords": ["선택된 서브키워드1", "선택된 서브키워드2"],
      "optimized_titles": {
          "strict_structure": [
              "첫 번째 제목",
              "두 번째 제목",
              "세 번째 제목"
          ],
          "creative_structure": [
              "네 번째 제목",
              "다섯 번째 제목",
              "여섯 번째 제목"
          ]
      }
    }
`,

  template: `### 블로그 제목 최적화 분석 ###
    아래는 '{mainKeyword}' 키워드로 네이버 블로그 상위에 노출된 블로그 제목 예시입니다.
    
    서비스 분석:
    {{serviceAnalysis}}
    
    상위 노출 제목들:
    {{highImportanceTitles}}
    
    참고할 추가 제목들:
    {{lowImportanceTitles}}
    
    제목 분석 항목:
    1. 메인 키워드 분석
       - 띄어쓰기 패턴 (붙여쓰기/띄어쓰기 빈도 분석)
       - 제목 내 위치 (앞/중간/뒤)
    
    2. 제목 길이 분석
       - 평균 음절 수
       - 평균 글자 수
       - 가독성이 좋은 길이 파악
    
    3. 키워드 패턴 분석
       - 자주 함께 사용되는 연관 키워드 조합
       - 키워드 간 순서와 배치
       - 공통적으로 등장하는 단어/표현
    
    4. 서비스 차별점 분석
       - 경쟁사 대비 핵심 장점
       - 타겟 고객층의 니즈
       - 서비스의 독특한 가치 제안
    
    아래는 사용 가능한 서브키워드 목록입니다. 이 중에서 가장 효과적인 키워드를 1-2개 선택하여 제목에 활용해주세요:
    {{subkeywords}}
    
    제목 생성 필수 규칙:
    1. *** 가장 중요: 제목에는 반드시 메인 키워드 '{{mainKeyword}}'가 포함되어야 합니다 ***
    2. 선택한 서브키워드를 자연스럽게 조합하여 하나의 최적화된 제목 생성
    3. **메인키워드는 상위 노출 제목들의 주된 띄어쓰기 패턴을 따라 사용**
    4. **제목은 분석된 평균 음절/글자 수 범위 내에서 작성**
    5. **서비스분석 내용의 핵심 장점이나 차별점을 자연스럽게 녹여내기**
    6. **타겟 고객층의 니즈와 연관된 표현 사용**

`,
  generatePrompt: (
    mainKeyword: string,
    highImportanceTitles: string[],
    lowImportanceTitles: string[],
    subkeywords: string[],
    serviceAnalysis?: Analysis
  ): string => {
    return titlePrompt_test.template
      .replace("{{mainKeyword}}", mainKeyword)
      .replace("{{highImportanceTitles}}", highImportanceTitles.join('\n'))
      .replace("{{lowImportanceTitles}}", lowImportanceTitles.join('\n'))
      .replace("{{subkeywords}}", subkeywords.join('\n'))
      .replace("{{serviceAnalysis}}", JSON.stringify(serviceAnalysis));
  }
};


//response_format 

// 응답은 반드시 아래 JSON 구조로만 출력하세요. JSON 외의 어떤 내용도 출력하지 말아야 합니다.:
// {
//     "analysis_results": {
//         "keyword_structure": {
//             "spacing_pattern": "주로 발견되는 띄어쓰기 패턴",
//             "position_pattern": "주로 발견되는 위치",
//             "average_length": {
//                 "syllables": "평균 음절 수",
//                 "characters": "평균 글자 수"
//             }
//         },
//         "common_patterns": ["패턴1", "패턴2", "패턴3"],
//         "service_insights": {
//             "unique_value": "서비스만의 차별점",
//             "target_needs": "타겟 고객 니즈"
//         }
//     },
//     "selected_subkeywords": ["선택된 서브키워드1", "선택된 서브키워드2"],
//     "optimized_title": "생성된 최적화 제목"
// }