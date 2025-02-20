import { AnalysisResults, BrnadContent } from "../../types";

export const introPrompt = {
  system: `You are a professional Blogger in Korea who writes in '정중체' style. Every sentence should be polite, formal, and respectful.
        Your task is to create an introduction (서론) for a branding article that not only analyzes the title and table of contents but also addresses the customer's underlying concerns and dilemmas. The introduction must empathetically acknowledge the reader's confusion or hesitation when choosing a service, and then highlight the brand's expertise, trustworthiness, and unique value. It should clearly indicate why the brand is the best solution in a competitive market.
        
        Here's the blog style of Naver Blog:

    # 네이버 블로그 말투 특징
        
        ## 1. 종결어미 스타일
        - 친근한 구어체 '-요' 종결
        - 격식있는 '-습니다/입니다' 종결
        - 비격식 구어체 '-임/염' 종결
        - 감탄형 '-네요/군요' 종결
        
        ## 2. 텍스트 강조 요소
        - 물결표 '~' 사용
        - 느낌표/물음표 중복 사용
        
        ## 3. 문장 구조적 특징
        - 짧은 문장 위주 구성
        - 의문문 형태의 호기심 유발
        - 명사형 종결 많음
        - 구어체 반복 사용
        
        ## 4. 독자 상호작용 요소
        - 질문형 문장 사용
        - 공감 유도 표현
        - 직접적 추천/제안
        - 경험 공유 요청
        
        ## 5. 콘텐츠 구조화 요소
        - 키워드 강조
        - 단계별 설명
        - 카테고리화
        - 요약/정리 문구
        
        ## 예시 모음
        
        ### 1. 종결어미 스타일 예시
        
        친근한 구어체:
        - "오늘은 새로 산 화장품 리뷰할게요~"
        - "진짜 맛있더라구요!"
        - "같이 보러 가실래요?"
        
        격식체:
        - "이번 포스팅에서 말씀드리고자 합니다."
        - "다음과 같은 특징이 있습니다."
        - "사용해보신 후 판단하시기 바랍니다."
        
        
        ### 3. 문장 구조 예시
        
        짧은 문장:
        - "오늘도 맛집 탐방."
        - "역시 실패없는 선택."
        - "완벽한 하루 끝."
        
        의문문:
        - "여러분은 어떠신가요?"
        - "같이 보러 가실래요?"
        - "이런 경험 있으신가요?"
        
        ### 4. 독자 상호작용 예시
        
        질문형:
        - "여러분은 어떤 제품 사용하시나요?"
        - "오늘 저녁 뭐 먹을지 고민되시나요?"
        - "같이 방문해보시겠어요?"
        
        공감 유도:
        - "다들 이런 경험 있으시죠?"
        - "저만 그런가요...?"
        - "공감하시는 분들 손들어주세요!"
        
        
        ### 5. 콘텐츠 구조화 예시
        
        키워드 강조:
        - "[강남/맛집/젤라또] 여기가 바로 그 맛집"
        - "【초보자용/쉬운설명】 카메라 입문하기"
        - "#육아템 #육아필수템 #육아용품추천"
        
        단계별 설명:
        - "Step 1. 재료 준비하기"
        - "Point 1. 가장 중요한 것은"
        - "TIP 1. 놓치지 말아야 할 포인트"


            **Prefill JSON Response**
    {
      "analysis_results": {
        "titleAnalysis": {
          "message": "",
          "reasonsForClick": [],
          "why": []
        },
        "tocAnalysis": {
          "message": "",
          "keyTopics": [],
          "contentFlow": "",
          "uniqueValue": ""
        },
        "yesSetQuestions": []
      },
      "optimized_intro": ""
    } 	
      `,
  // 템플릿 1: analysis가 없는 기본 상황
  template1: `
          
    \n\nHuman:
    다음 제목과 목차를 분석하고, YES-SET 기법을 사용하여 독자의 관심을 확 끌 수 있는 서론을 작성해줘. 
    서론은 고객이 단순히 가격이나 평판만으로 결정하기 어려운 고민과 혼란을 공감하며, 브랜드의 전문성과 신뢰, 그리고 차별화된 강점을 자연스럽게 전달해야 합니다. 또한 고객이 느끼는 불안과 의문을 해소할 수 있도록, 핵심 서비스 가치를 명확히 제시해야 합니다. 작성 시 정중체와 음슴체를 활용하여 매력적으로 구성해주시길 바랍니다.
    
      1. 메인 키워드: "{mainKeyword}"
      2. 제목: "{title}"
      3. 목차: "{toc}"
    
    ### 작성 단계임
    
    1. **제목과 목차 분석**
       - 제목과 목차가 전달하는 핵심 메시지를 단순화하여 분석하기
       - 콘텐츠의 전체 흐름과 독자가 얻을 인사이트를 도출하기
       - 고객이 가질 수 있는 주요 궁금증과 고민, 불안을 파악하기
       - 브랜드의 전문성과 차별점이 독자의 선택에 미치는 영향을 고려하기
    
    2. **YES-SET 구성**
       - 독자가 제목과 목차에 "응" 하고 답할 수 있는 질문 2-3개 만들기
       - 질문은 독자의 고민과 감정적 연결, 그리고 브랜드의 강점을 반영해야 함
       - 예시: "이런 경험 있으시죠?", "이거 나만 그런 거 아니죠?", "같이 해결해 보실 분 있으신가요?"
    
    3. **서론 작성 가이드**
       - YES-SET 질문을 활용해 서론 작성하기
       - 고객의 고민을 공감하며, 브랜드의 전문성과 신뢰를 자연스럽게 녹여내기
       - 예시: "서비스 선택에 어려움이 있으신가요?...", "전문가가 알려주는 해결책입니다."
       - 정중체와 음슴체를 혼용하여 친근하면서도 전문적인 톤 유지하기
       
    4. **서론 작성 조건**
       - 모든 문장은 문장부호로 끝나야 함
       - 흥미와 공감을 이끌어내는 내용 포함
       - 구체적이고 생생한 표현 사용
       - 목차 분석 내용을 자연스럽게 반영하여, 브랜드의 핵심 가치와 차별점을 제시할 것
       
    5. **서론 생성 규칙**
        - 서론은 600~700자 이내로 작성할 것
        - 줄바꿈이나 탭은 \\n으로 처리할 것
        - **반드시 아래 JSON 구조로만 출력할 것. 다른 내용은 절대 포함하지 말 것.**
    \n\nAssistant:
    {
      "analysis_results": {
        "titleAnalysis": {
          "message": "{제목 분석 내용}",
          "reasonsForClick": ["{이유1}", "{이유2}", "{이유3}"],
          "why": ["{키워드1}", "{키워드2}", "{키워드3}"]
        },
        "tocAnalysis": {
          "message": "{목차 분석 내용}",
          "keyTopics": ["{주제1}", "{주제2}", "{주제3}"],
          "contentFlow": "{콘텐츠 흐름}",
          "uniqueValue": "{차별화된 가치}"
        },
        "yesSetQuestions": ["{질문1}", "{질문2}", "{질문3}"]
      },
      "optimized_intro": "{서론 내용}"
  } 
      `,
  // 템플릿 2: analysis와 brandContent가 있는 경우 (주제, 서비스 가치, 분석결과 반영)
  template2: `
\n\nHuman:
다음 제목과 목차, 그리고 분석 데이터를 바탕으로 YES-SET 기법을 사용하여 독자의 관심을 확 끌 수 있는 서론을 작성해줘. 
서론은 고객의 혼란과 고민을 공감하며, 브랜드의 전문성, 신뢰, 그리고 차별화된 강점을 반영하여 고객이 올바른 선택을 할 수 있도록 안내해야 합니다. 고객이 단순한 가격이나 평판 이상의 가치를 인식하도록, 브랜드의 서비스 가치를 명확하게 전달해 주시길 바랍니다. 작성은 음슴체와 정중체를 혼용하여 매력적으로 구성할 것.

1. 메인 키워드: "{mainKeyword}"
2. 제목: "{title}"
3. 주제: "{topic}"
4. 목차: "{toc}"
5. 서비스명: "{serviceName}"
6. 서비스 가치: "{serviceValues}"
7. 서비스분석: {serviceAnalysis}

### 작성 단계임

1. **제목, 주제, 목차 분석**
   - 제목과 주제가 전달하는 핵심 메시지 및 목차의 흐름을 단순화하여 분석하기
   - 브랜드의 서비스 가치와 차별점을 고려해, 고객이 얻을 인사이트와 해결책 도출하기
   - 고객이 가질 수 있는 주요 궁금증, 불안, 그리고 고민을 분석하여, 감정적 연결 및 신뢰 구축 요소 파악하기

2. **YES-SET 구성**
   - 독자가 제목, 주제, 목차 및 서비스 가치에 "응" 하고 답할 수 있는 질문 2-3개 생성
   - 질문은 고객의 고민과 감정적 연결, 그리고 브랜드의 전문성과 강점을 반영할 것
   - 예시: "이런 경험 있으신가요?", "이거 나만 그런 거 아니죠?", "전문가의 조언, 믿으실 수 있나요?"

3. **서론 작성 가이드**
   - YES-SET 질문을 활용하여 서론 작성하기
   - 브랜드의 주제와 서비스 가치를 자연스럽게 녹여내어, 고객의 고민 해결과 신뢰 구축에 중점을 둘 것
   - 정중체와 음슴체를 혼용해 친근하면서도 전문적인 어조 유지하기

4. **서론 작성 조건**
   - 흥미를 유발하고 공감을 이끌어낼 수 있게 작성할 것
   - 구체적이고 생생한 표현 사용
   - 분석 데이터와 서비스 분석의 핵심 장점 및 차별점을 반드시 포함할 것
   - JSON 구조로만 출력할 것 (다른 내용은 포함하지 말 것)

\n\nAssistant:
{
  "analysis_results": {
    "titleAnalysis": {
      "message": "{제목 분석 내용임}",
      "reasonsForClick": ["{이유1임}", "{이유2임}", "{이유3임}"],
      "why": ["{키워드1임}", "{키워드2임}", "{키워드3임}"]
    },
    "tocAnalysis": {
      "message": "{목차 분석 내용임}",
      "keyTopics": ["{주제1임}", "{주제2임}", "{주제3임}"],
      "contentFlow": "{콘텐츠 흐름임}",
      "uniqueValue": "{차별화된 가치임}"
    },
    "yesSetQuestions": ["{질문1임}", "{질문2임}", "{질문3임}"]
  },
  "optimized_intro": "{서론 내용임}"
}
  `,
  generatePrompt: (
    mainKeyword: string,
    title: string,
    toc: string,
    brandContent?: BrnadContent,
    analysis?: AnalysisResults[]
  ): string => {
    // 상황 2: brandContent와 analysis 모두 제공되는 경우
    if (brandContent && analysis) {
      return introPrompt.template2
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
        .replace("{topic}", brandContent.topic)
        .replace("{serviceName}", brandContent.serviceName)
        .replace("{serviceValues}", brandContent.serviceValues.join(", "))
        .replace("{serviceAnalysis}", JSON.stringify(analysis));
    } else {
      // 상황 1: analysis 및 brandContent가 없는 경우
      return introPrompt.template1
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
    }
  }
};
