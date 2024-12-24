import { Analysis } from "../../types";

export const titlePrompt = {
  system: `You are a professional SEO expert who specializes in creating highly effective blog titles optimized for Naver search results, particularly focusing on smart block tab placements.

    **Prefill JSON Response**
    {
      "analysis_results": {
        "tab_patterns": {
          "high_importance": {
            "repeated_keywords": ["탭1 반복 키워드1", "탭1 반복 키워드2"],
            "keyword_positions": "키워드 위치 패턴",
            "phrase_patterns": ["자주 사용되는 구문1", "자주 사용되는 구문2"],
            "title_structure": "제목 구조 패턴"
          },
          "middle_importance": {
            "repeated_keywords": ["탭2 반복 키워드1", "탭2 반복 키워드2"],
            "keyword_positions": "키워드 위치 패턴",
            "phrase_patterns": ["자주 사용되는 구문1", "자주 사용되는 구문2"],
            "title_structure": "제목 구조 패턴"
          },
          "low_importance": {
            "repeated_keywords": ["탭3 반복 키워드1", "탭3 반복 키워드2"],
            "keyword_positions": "키워드 위치 패턴",
            "phrase_patterns": ["자주 사용되는 구문1", "자주 사용되는 구문2"],
            "title_structure": "제목 구조 패턴"
          }
        },
        "keyword_structure": {
          "spacing_pattern": "주로 발견되는 띄어쓰기 패턴",
          "position_pattern": "주로 발견되는 위치",
          "average_length": {
            "syllables": "평균 음절 수",
            "characters": "평균 글자 수"
          }
        },
        "common_patterns": ["패턴1", "패턴2", "패턴3"]
      },
      "selected_subkeywords": ["선택된 서브키워드1", "선택된 서브키워드2"],
      "optimized_titles": {
          "strict_structure": [
              "첫 번째 탭 패턴 기반 제목",
              "두 번째 탭 패턴 기반 제목",
              "세 번째 탭 패턴 기반 제목"
          ],
          "creative_structure": [
              "상위노출 제목 구조 기반 + 서브키워드 활용 제목 1",
              "상위노출 제목 구조 기반 + 서브키워드 활용 제목 2",
              "상위노출 제목 구조 기반 + 서브키워드 활용 제목 3"
          ]
      }
    }
`,

  template: `### 네이버 스마트 블록 탭별 제목 최적화 분석 ###
    아래는 '{mainKeyword}' 키워드로 네이버 블로그 스마트 블록의 각 탭에 노출된 제목들입니다.
    
    서비스 분석:
    {{serviceAnalysis}}
    
    첫 번째 탭 노출 제목들:
    {{highImportanceTitles}}
    
    두 번째 탭 노출 제목들:
    {{middleImportanceTitles}}
    
    세 번째 탭 노출 제목들:
    {{lowImportanceTitles}}
    
    각 탭별 제목 상세 분석:
    1. 반복되는 패턴 분석 (필수)
       - 각 탭별로 2회 이상 등장하는 키워드 목록 작성
       - 각 탭별로 2회 이상 등장하는 문구/표현 패턴 기록
       - 각 탭의 키워드 위치 패턴 수치화 (시작/중간/끝 비율)
       - 각 탭의 제목 구조를 템플릿화하여 기록
    
    2. 메인 키워드 상세 분석 (필수)
       - 각 탭별 메인 키워드 앞/뒤에 자주 오는 단어 기록
       - 각 탭별 메인 키워드 띄어쓰기 패턴 빈도 분석
       - 각 탭별 메인 키워드와 자주 조합되는 단어 목록화
    
    3. 탭별 제목 구조 분석 (필수)
       - 각 탭 제목의 시작/중간/끝 부분 패턴 정리
       - **시작 패턴 중요**
       - 각 탭의 평균 음절 수와 글자 수 정확히 계산
       - 각 탭의 문장 구조 패턴 (주어+서술어, 명사나열 등) 분석
    
    사용 가능한 서브키워드 목록:
    {{subkeywords}}
    
    제목 생성 필수 규칙:
    1. *** 절대 규칙 ***
       - 메인 키워드 '{mainKeyword}' 필수 포함
       - 각 탭에서 발견된 반복 패턴 최소 1개 이상 필수 활용
       - 각 탭의 평균 글자 수 범위 준수
       - 각 탭의 주요 키워드 위치 패턴 준수
    
    2. strict_structure 제목 생성 규칙:
       **참조 제목과 완전히 동일한 제목 금지**
       **엄격하게 탭의 반복 패턴을 따르기**
       - 첫 번째 제목: 첫 번째 탭의 반복 키워드/구문 중 최소 2개 이상 포함
       - 두 번째 제목: 두 번째 탭의 반복 키워드/구문 중 최소 2개 이상 포함
       - 세 번째 제목: 세 번째 탭의 반복 키워드/구문 중 최소 2개 이상 포함
    
    3. creative_structure 제목 생성 규칙:
       - 각 탭의 핵심 패턴은 유지하되 서브키워드로 변형
       - 반복 패턴이 가장 많은 탭의 구조를 우선 활용
       - 각 탭의 주요 문구/표현을 서브키워드와 조합
    
    4. 탭별 패턴 준수 규칙:
       - 각 탭의 시작/중간/끝 문구 패턴 엄격 준수
       - 각 탭의 키워드 배치 위치 정확히 따르기
       - 각 탭의 주요 조합 키워드 활용
       - 각 탭의 문장 구조 패턴 유지

`,
  generatePrompt: (
    mainKeyword: string,
    highImportanceTitles: string[],
    middleImportanceTitles: string[],
    lowImportanceTitles: string[],
    subkeywords: string[],
    serviceAnalysis?: Analysis
  ): string => {
    return titlePrompt.template
      .replace("{{mainKeyword}}", mainKeyword)
      .replace("{{highImportanceTitles}}", highImportanceTitles.join('\n'))
      .replace("{{middleImportanceTitles}}", middleImportanceTitles.join('\n'))
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