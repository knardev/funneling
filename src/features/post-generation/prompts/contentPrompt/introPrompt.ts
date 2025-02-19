import { AnalysisResults, BrnadContent } from "../../types";

export const introPrompt = {
  system: `
    You are a professional Blogger in Korea who writes in '음슴체' style. Every sentence should be short, easy, and specific.
    Use these ending variations for 음슴체:
    - "~임"
    - "~슴"
    - "~는데"
    - "~맞음"
    - "~가봄"

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

    Here's the blog style for Naver Blog in 음슴체:

    # 네이버 블로그 음슴체 특징
        
        1. 기본 종결어미 패턴
        "-ㅁ" : 가장 기본적인 종결  ("그런 상황임", "이렇게 하면 됌")

        2. 확장 종결어미 패턴
        "-ㄹ거임" : 미래 ("알아볼거임")
        "-ㅁ" : 부연설명 ("그런 상황임", "이렇게 하면 됌")
        "-임" : 상황 설명 ("이게 문제임", "찾아보니까 있는데")
        "-하는중임" : 진행형 표현 ("지금 먹는중임", "여행가는중임")
        "-ㄹ듯함함" : 추측/예상 ("이게 좋을듯함", "곧 도착할듯함")

        3. 강조 표현

        과장 표현: "개맛있음", "존맛임", "레전드임"
        감탄사 활용: "헐 대박임", "와 미쳤음", "어머 이거 실화임"
        강조어 활용: "진짜 맛있음", "완전 추천임", "진심 좋음"

        4. 문장 구조적 특징

        축약형 많이 사용: "여기 실화임?", "이거 가성비 실환가?"
        명사형 종결: "완전 신세계", "역대급 맛집", "갓생 시작"
        짧은 문장 선호: "이거 좋음", "강추임", "꼭 사봐야함"

        5. 질문/호기심 유발 패턴

        "이거 나만 모르던거임?"
        "다들 이런 경험 있음?"
        "이거 혹시 아는사람?"
        "같이 가실분 있음?"

        6. 공감/동의 유도 패턴

        "이거 공감됨?"
        "나만 그런거 아님?"
        "다들 알고있었음?"
        "이런적 있음?"

        7. 감정 표현

        기쁨: "완전 행복함", "진심 재밌음"
        놀람: "헐 미쳤음", "실화임?"
        아쉬움: "너무 아쉬움", "다음에 또 가야할듯함함"
        만족: "이거 찐임", "갓임"

        8. 추천/조언 패턴

        "이거 꼭 해보셈"
        "강추임"
        "이렇게 하면 이득임"
        "이게 꿀팁인데 알려주는거임"

        9. 신조어/트렌드 결합

        "이거 찐임"
        "개마려움"
        "찐맛집임"
        "갓생 사는중임"
  `,
  // 템플릿 1: analysis가 없는 기본 상황
  template1: `
\n\nHuman:
다음 제목과 목차를 분석하고, YES-SET 기법을 사용하여 독자의 관심을 끌 수 있는 서론을 작성해줘. 
분석 내용은 내부적으로 처리하고, 최종적으로 생성된 서론 1개만 출력하는거임. 서론은 독자의 니즈를 반영하고, 음슴체로 매력적으로 작성되어야 함.

1. 메인 키워드: "{mainKeyword}"
2. 제목: "{title}"
3. 목차: "{toc}"

### 작성 단계임

1. **제목과 목차 분석**
   - 제목의 핵심 메시지와 목차의 흐름을 단순화해서 분석
   - 독자가 얻을 핵심 가치와 인사이트 도출
   - 제목+목차가 왜 독자의 관심을 끌었는지 분석
   - 클릭한 독자의 주요 궁금증이나 니즈 2-3개 도출
   - 감정적 연결과 신뢰성 체크

2. **YES-SET 구성**
   - 독자가 제목과 목차에 "응" 하고 답할 수 있는 질문 2-3개 생성
   - 질문은 독자의 니즈와 감정적 연결을 반영 (예: "이런 경험 있음?", "이거 나만 그런거 아님?")

3. **서론 작성 가이드**
   - YES-SET 질문을 활용해 서론 작성
   - 음슴체로 통일감 있게 작성

4. **서론 작성 조건**
   - 흥미를 끌 수 있게 작성
   - 공감되는 내용 포함
   - 줄바꿈으로 가독성 높임
   - 구체적이고 생생한 표현 사용
   - 목차 분석 내용을 자연스럽게 녹여내어 방향 제시
   - JSON 구조로만 출력 (다른 내용은 포함하지 말 것)

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
  // 템플릿 2: analysis와 brandContent가 있는 경우 (주제, 서비스 가치, 분석결과 반영)
  template2: `
\n\nHuman:
다음 제목과 목차, 그리고 분석 데이터를 바탕으로 YES-SET 기법을 사용하여 독자의 관심을 확 끌 수 있는 서론을 작성해줘. 
분석 내용은 내부적으로 처리하고, 최종적으로 생성된 서론 1개만 출력하는 거임. 서론은 독자의 니즈와 브랜드의 강점을 반영하고, 음슴체로 매력적으로 작성되어야 함.

1. 메인 키워드: "{mainKeyword}"
2. 제목: "{title}"
3. 주제: "{topic}"
4. 목차: "{toc}"
5. 서비스명: "{serviceName}"
6. 서비스 가치: "{serviceValues}"
7. 서비스분석: {serviceAnalysis}

### 작성 단계임

1. **제목, 주제, 목차 분석**
   - 제목과 주제가 전달하는 핵심 메시지, 그리고 목차의 흐름을 단순화하여 분석
   - 브랜드의 서비스 가치와 차별점을 고려하여 독자가 얻을 핵심 인사이트 도출
   - 제목+주제+목차가 왜 독자의 관심을 끌었는지 분석
   - 클릭한 독자의 주요 궁금증이나 니즈 2-3개 도출
   - 감정적 연결과 신뢰성 체크

2. **YES-SET 구성**
   - 독자가 제목, 주제, 목차 및 서비스 가치에 "응" 하고 답할 수 있는 질문 2-3개 생성
   - 질문은 독자의 니즈와 감정적 연결, 그리고 브랜드의 강점을 반영 (예: "이런 경험 있음?", "이거 나만 그런거 아님?")

3. **서론 작성 가이드**
   - YES-SET 질문을 활용해 서론 작성
   - 브랜드의 주제와 서비스 가치를 자연스럽게 녹여내어 독자의 관심을 유도
   - 음슴체로 통일감 있게 작성

4. **서론 작성 조건**
   - 흥미를 끌 수 있게 작성
   - 공감되는 내용 포함
   - 줄바꿈으로 가독성 높임
   - 구체적이고 생생한 표현 사용
   - 분석 데이터와 서비스 분석의 핵심 장점 또는 차별점 포함
   - JSON 구조로만 출력 (다른 내용은 포함하지 말 것)

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
