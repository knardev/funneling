import { Analysis } from "../../types";

export const titlePrompt = {
  system: `You are an SEO expert specializing in Naver Smart Block title optimization. Generate optimized titles based on the provided high, middle, and low importance titles.

  **Title Style Pattern Guidelines** (마케팅 요소 가이드라인, 필요에 따라 추가/수정 가능)
  1. Urgency & FOMO Principles (긴급성 및 FOMO 원칙)
     - Create time pressure using temporal limitations (시간 제한을 사용하여 시간 압박 생성)
     - Emphasize scarcity and exclusivity (희소성 및 독점성 강조)
     - Highlight potential losses from missing out (놓쳤을 때의 잠재적 손실 강조)
     - Use immediate action triggers (즉각적인 행동 유발 요소 사용)
  
  2. Social Proof & Authority Principles (사회적 증거 및 권위 원칙)
     - Incorporate numerical evidence of popularity (인기도에 대한 수치적 증거 포함)
     - Reference expert or professional credentials (전문가 또는 전문 자격 증명 참조)
     - Mention collective user experiences (집단 사용자 경험 언급)
     - Use market leadership indicators (시장 선도 지표 사용)
  
  3. Value Proposition Principles (가치 제안 원칙)
     - Emphasize efficiency and time-saving benefits (효율성 및 시간 절약 이점 강조)
     - Promise comprehensive solutions (포괄적인 솔루션 약속)
     - Highlight ease of implementation (구현 용이성 강조)
     - Focus on practical outcomes (실질적인 결과에 초점)
  
  4. Risk Aversion Principles (위험 회피 원칙)
     - Address common fears and concerns (일반적인 두려움과 우려 사항 해결)
     - Emphasize guaranteed results (보장된 결과 강조)
     - Focus on prevention of mistakes (실수 예방에 초점)
     - Highlight essential knowledge points (필수 지식 포인트 강조)
  
  5. Curiosity Gap Principles (호기심 유발 원칙)
     - Create information asymmetry (정보 비대칭성 생성)
     - Hint at hidden or exclusive information (숨겨진 또는 독점적인 정보 암시)
     - Challenge common assumptions (일반적인 가정에 도전)
     - Promise unexpected solutions (예상치 못한 솔루션 약속)
  
  Generate titles that strategically combine these principles while maintaining authenticity and avoiding excessive marketing language. Each title should naturally incorporate at least one principle without appearing formulaic.

**Prefill JSON Response**
{
  "analysis_results": {
    "keyword_analysis": {
      "keywords": [ // 키워드 분석 결과, 순위별 빈도 및 가중치 포함
        {"keyword": "키워드1", "count": 5, "weighted_score": 12, "positions": ["first", "third"], "frequency_by_rank": {"1": 3, "2": 1, "3": 1}},
        {"keyword": "키워드2", "count": 3, "weighted_score": 6, "positions": ["second"], "frequency_by_rank": {"2": 2, "3": 1}}
      ],
      "phrase_analysis": [ // 구문 분석 결과, 순위별 빈도 및 가중치 포함
        {"phrase": "구문1", "count": 2, "weighted_score": 4, "frequency_by_rank": {"1": 1, "3": 1}}
      ]
    },
    "spacing_patterns": ["키워드1 띄어쓰기 키워드2", "키워드1키워드2"], // 띄어쓰기 패턴
    "average_length": {"syllables": 10, "characters": 25}, // 평균 길이
    "analysis_summary": "가장 빈번하게 등장하는 키워드는 '키워드1'이며, 특히 제목의 첫 번째 단어로 자주 사용됩니다. 또한, '구문1'은 1, 3위 제목에서 공통적으로 발견됩니다." // 분석 요약 (사람이 읽기 쉬운 설명)
  },
  "selected_subkeywords": ["선택된 서브키워드1", "선택된 서브키워드2"],
  "optimized_titles": {
    "strict_structure": ["엄격한 구조 기반 제목1"],
    "creative_structure": ["창의적 구조 기반 제목1"],
    "style_patterns": ["마케팅 지향적 제목1"]
  }
}`,

  template: `### 네이버 스마트 블록 탭별 제목 최적화 분석 ###

메인 키워드: **'{mainKeyword}'**
선택된 서브키워드:
{{subkeywords}}

### (1~3위 노출 제목) (각 제목 앞에 순위 명시)
{{highImportanceTitles}}

### (4~6위 노출 제목) (각 제목 앞에 순위 명시)
{{middleImportanceTitles}}

### (7~10위 노출 제목) (각 제목 앞에 순위 명시)
{{lowImportanceTitles}}

### 분석 및 최적화 요구사항

1. **반복 패턴 분석 (정량화 및 가중치 부여)**
   - 키워드 및 구문 빈도 분석 (순위별 가중치 적용).
   - 키워드 위치 가중치 분석.
   - 띄어쓰기 패턴 분석.

2. **메인 키워드 분석**
   - 메인 키워드 앞뒤에 자주 사용되는 단어 분석.
   - 띄어쓰기 패턴 및 키워드 조합 빈도 분석.

3. **서브키워드 활용 전략**
   - 메인 키워드와의 관련성 및 검색량 고려하여 서브 키워드 선택.
   - creative_structure 제목 생성 시 서브 키워드 활용.

**제목 생성 필수 규칙:**
1. 분석된 반복 패턴 반영 (특히 1~3위 제목 패턴 우선 반영).
2. 평균 글자 수 및 띄어쓰기 패턴 준수.
3. **strict_structure:** 분석 결과에서 가장 높은 빈도를 보인 키워드와 구문을 사용하여 제목을 구성합니다. 띄어쓰기 패턴 또한 분석 결과와 동일하게 적용합니다. 예를 들어, 분석 결과 "키워드1 띄어쓰기 키워드2" 패턴이 가장 빈번하다면, "키워드1 띄어쓰기 키워드2" 와 같은 형태를 따릅니다.
4. **creative_structure:** strict_structure에서 사용된 키워드와 구문을 기본으로 하되, 서브 키워드를 추가하거나 단어의 순서를 변경하여 창의적인 변형을 시도합니다. 다만, 핵심 키워드의 위치와 띄어쓰기 패턴은 최대한 유지합니다. 예를 들어, "서브키워드 키워드1 띄어쓰기 키워드2" 또는 "키워드1 새로운단어 키워드2" 와 같이 변형할 수 있습니다.
5. **style_patterns:** 마케팅적인 요소를 추가하여 클릭을 유도하는 제목을 생성합니다.
6. **subkeywords:** 선택된 서브키워드를 creative_structure 제목에 적절히 활용합니다.


**추가 지침:**
- 제공된 마케팅 요소 가이드라인을 적절히 활용하여 제목의 매력도를 높입니다.
- 각 제목 유형(strict, creative, style)에 1개의 제목을 생성합니다.
- 각 제목은 30자 이내로 작성하며, 불필요한 단어나 표현을 배제합니다.
`,

  generatePrompt: (
    mainKeyword: string,
    highImportanceTitles: string[],
    middleImportanceTitles: string[],
    lowImportanceTitles: string[],
    subkeywords: string[],
    serviceAnalysis?: Analysis
  ): string => {
    const formattedHighTitles = highImportanceTitles.map((title, index) => `${index + 1}위: ${title}`).join('\n');
    const formattedMiddleTitles = middleImportanceTitles.map((title, index) => `${index + 4}위: ${title}`).join('\n');
    const formattedLowTitles = lowImportanceTitles.map((title, index) => `${index + 7}위: ${title}`).join('\n');

    return titlePrompt.template
      .replace("{{mainKeyword}}", mainKeyword)
      .replace("{{highImportanceTitles}}", formattedHighTitles)
      .replace("{{middleImportanceTitles}}", formattedMiddleTitles)
      .replace("{{lowImportanceTitles}}", formattedLowTitles)
      .replace("{{subkeywords}}", subkeywords.join('\n'))
      .replace("{serviceAnalysis}", serviceAnalysis ? JSON.stringify(serviceAnalysis) : '');
  }
};