import { AnalysisResults, BrnadContent, ToneType } from "../../types";

export const bodyPrompt = {
  systems: {
    정중체: `You are a professional Blogger in Korea who writes in '정중체' style. Every sentence should be polite, formal, and respectful.
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
      - "같이 방문해보실래요?"
      
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

    `,
    음슴체: ` 
    You are a professional Blogger in Korea who writes in '음슴체' style. Every sentence should be polite, formal, and respectful.
      Here's the blog style of Naver Blog:
      
  - "~임"
  - "~슴"
  - "~는데"
  - "~맞음"
  - "~가봄"

    Here's the blog style for Naver Blog in 음슴체:

  # 네이버 블로그 음슴체 특징
      
      1. 기본 종결어미 패턴
      "-ㅁ" : 가장 기본적인 종결  ("그런 상황임", "이렇게 하면 됌")

      2. 확장 종결어미 패턴

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

    **Prefill JSON Response**
    {
      "analysis_results": {
        "introandtocAnalysis": {
          "message": "{서론 및 목차 분석 내용}",
          "keyElementsForBody": ["{핵심 요소1}", "{핵심 요소2}", "{핵심 요소3}"]
        }
      },
      "optimized_body": "{본론 내용}"
    }
  `,
  },
  // 템플릿 1: brandContent와 analysis가 없는 기본 상황
  templates:{
    template1: `
\n\nHuman:
### 본론 생성 프롬프트

**Human:**
다음 제목, 목차 및 서론을 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 본론을 작성해 주세요.  
본론은 독자가 직면한 문제를 먼저 제기하여 그들의 궁금증과 불안을 자극한 후, 구체적인 정보와 통찰을 제공하여 문제 해결의 방향을 제시해야 합니다.  
즉, 문제(Problem)를 제기한 후 친근감(Affinity)을 형성하고, 브랜드의 강점을 활용한 해결책(Solution)과 구체적인 제안(Offer)을 통해 독자가 실제 행동(Action)을 취하도록 유도하는 흐름으로 작성해 주시길 바랍니다.  
본문은 목차에 따른 자연스러운 전개와 함께, 독자에게 실질적인 도움이 되는 정보와 사례를 제공해야 합니다.  
주의: 본론은 글의 마무리나 결론을 포함하지 않으며, 결론은 별도로 생성됩니다.  
**반드시 최소 4000자 이상의 본문을 작성할 것**

메인키워드: {mainKeyword}  
제목: "{title}"  
목차: "{toc}"  
서론: "{intro}"  

### 작성 가이드

1. **제목 및 서론 분석**  
   - 제공된 제목과 서론의 핵심 메시지를 간결하게 요약하고, 독자가 기대하는 정보 및 해결 방안을 도출합니다.
   - 독자가 가질 수 있는 주요 질문과 고민을 파악하여, 이를 해결할 수 있는 실질적인 정보 제공에 집중합니다.

2. **독자의 궁금증 및 문제 제기**  
   - 제목, 서론, 목차를 바탕으로 독자가 겪고 있을 문제(Problem)를 명확하게 제시합니다.
   - 이와 함께 "이런 고민 있으신가요?"와 같이 독자의 감정에 공감할 수 있는 질문(YES-SET)을 포함합니다.

3. **글 전개 흐름: YES-SET 구성**  
   아래 순서대로 글을 전개할 것:
   - **Problem (문제 제기):** 독자가 직면한 문제와 고민을 구체적으로 설명하여, 그들의 관심을 끌어냅니다.
   - **Affinity (친근감 형성):** 독자의 경험과 감정을 공감하며, 친근하고 정중한 어조로 연결합니다.
   - **Solution (해결책 제시):** 브랜드의 고유한 강점과 서비스 가치를 활용하여 문제의 해결책을 구체적으로 제시합니다.
   - **Offer (구체적 제안):** 독자가 실질적인 도움을 받을 수 있도록, 구체적인 실행 방안이나 팁을 제공합니다.
   - **Narrosing down (핵심 제한):** 내용을 핵심 포인트로 한정하여, 불필요한 정보를 배제하고 집중도를 높입니다.
   - **Action (행동 유도):** 독자가 즉각적인 행동을 취하도록 구체적인 다음 단계를 안내하는 문장으로 마무리합니다.

4. **본론 작성 가이드**  
   - 모든 문장은 쉽고, 짧고, 구체적이며 읽기 쉽게 작성할 것.
   - **본론의 말투는 서론을 따릅니다.**
   - 실제 사례나 경험을 통해 내용을 생생하게 전달하고, 독자가 쉽게 이해할 수 있도록 설명할 것.
   - 브랜드의 주제와 서비스 가치를 자연스럽게 녹여내어, 문제 해결의 구체적인 방향을 제시할 것.

5. **최종 출력 조건**  
   - 본문은 하나의 텍스트로 연결된 흐름으로 작성되어 JSON의 **optimized_body** 키 안에 포함되어야 하며, 모든 줄바꿈 및 탭 문자는 \\n 등으로 이스케이프 처리할 것.
   - **반드시 아래 JSON 구조로만 출력할 것:**
  
\n\nAssistant:
{
  "analysis_results": {
    "introandtocAnalysis": {
      "message": "{서론 및 목차 분석 내용}",
      "keyElementsForBody": ["{핵심 요소1}", "{핵심 요소2}", "{핵심 요소3}"]
    }
  },
  "optimized_body": "{본론 내용}"
}
  `,
  // 템플릿 2: brandContent와 analysis가 제공되는 경우 (추가 정보 반영)
  template2: `
\n\nHuman:
### 본론 생성 프롬프트

**Human:**
다음 제목, 목차, 서론, 그리고 브랜드 정보 및 분석 데이터를 바탕으로 독자가 기대하는 정보와 가치를 충족시키는 본론을 작성해 주세요.  
본론은 단순 정보 제공을 넘어, 먼저 독자가 겪는 문제(Problem)를 명확히 제시하여 그들의 고민과 불안을 자극하고, 이어서 친근감(Affinity)을 형성하며, 브랜드의 서비스 가치(서비스명과 서비스 가치)를 활용한 구체적인 해결책(Solution)을 제시해야 합니다.  
또한, 구체적인 제안(Offer)과 핵심 포인트 제한(Narrosing down)을 통해, 독자가 실질적인 행동(Action)을 취하도록 유도하는 흐름을 따라 작성해 주시길 바랍니다.  
본문은 목차를 기반으로 자연스럽게 구성되며, 브랜드의 주제와 서비스 가치를 효과적으로 반영하여 독자에게 매력적이고 구체적인 정보를 전달해야 합니다.  
주의: 본론은 글의 마무리나 결론을 포함하지 않으며, 결론은 별도로 생성됩니다.  

**반드시 최소 4000자 이상의 본문을 작성할 것**

메인키워드: {mainKeyword}  
제목: "{title}"  
주제: "{topic}"  
서비스명: "{serviceName}"  
서비스 가치: "{serviceValues}"  
서비스분석: {serviceAnalysis}  
목차: "{toc}"  
서론: "{intro}"  

### 작성 가이드

1. **제목, 주제, 서론 및 목차 분석**  
   - 제목과 주제가 전달하는 핵심 메시지와 목차의 흐름을 간결하게 분석합니다.
   - 브랜드의 서비스 가치와 차별점을 고려하여 독자가 얻을 핵심 인사이트를 도출합니다.
   - 독자의 주요 궁금증이나 니즈를 2-3개 도출하고, 감정적 연결과 신뢰성을 확인합니다.

2. **YES-SET 구성 및 Writing Flow**  
   아래 순서대로 글을 전개할 것:
   - **Problem (문제 제기):** 서비스분석 데이터를 활용하여 독자가 직면한 문제와 고민을 명확하게 제시합니다.
   - **Affinity (친근감 형성):** 독자가 공감할 수 있도록, 친근하면서도 정중한 어조로 문제에 대한 감정을 이끌어냅니다.
   - **Solution (해결책 제시):** 브랜드의 고유한 서비스 가치와 전문성을 활용해 문제 해결 방안을 구체적으로 제시합니다.
   - **Offer (구체적 제안):** 독자가 실질적인 도움을 받을 수 있도록, 구체적이고 실행 가능한 제안을 포함합니다.
   - **Narrosing down (핵심 제한):** 불필요한 정보를 배제하고, 핵심 포인트에 집중하여 내용을 한정합니다.
   - **Action (행동 유도):** 독자가 즉각적인 행동을 취하도록, 구체적인 다음 단계를 안내하는 문장으로 마무리합니다.

3. **본론 작성 가이드**  
   - 모든 문장은 쉽고, 짧고, 구체적이며 읽기 쉽게 작성합니다.
   - 본론의 말투는 서론을 따릅니다.
   - 실제 사례나 경험을 통해 내용을 생생하게 전달하며, 독자가 쉽게 이해할 수 있도록 설명합니다.
   - 브랜드의 주제와 서비스 가치를 자연스럽게 녹여내어, 문제 해결의 구체적인 방향을 제시합니다.

4. **최종 출력 조건**  
   - 본문은 하나의 텍스트로 연결된 흐름으로 작성되어 JSON의 **optimized_body** 키 안에 포함되어야 하며, 모든 줄바꿈 및 탭 문자는 \\n 등으로 이스케이프 처리할 것.
   - **반드시 아래 JSON 구조로만 출력할 것:**
  
\n\nAssistant:
{
  "analysis_results": {
    "introandtocAnalysis": {
      "message": "{서론 및 목차 분석 내용임}",
      "keyElementsForBody": ["{핵심 요소1임}", "{핵심 요소2임}", "{핵심 요소3임}"]
    }
  },
  "optimized_body": "{본론 내용임}"
}
  `,
  generatePrompt: (
    mainKeyword: string,
    title: string,
    toc: string,
    intro: string,
    tone: ToneType,
    brandContent?: BrnadContent,
    analysis?: AnalysisResults[]
  ):{system:string; prompt:string} => {
    const system = bodyPrompt.systems[tone];
    if (brandContent && analysis) {
      return {
        system: system,
        prompt: bodyPrompt.templates.template2
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{topic}", brandContent.topic)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
          .replace("{serviceName}", brandContent.serviceName)
          .replace("{serviceValues}", brandContent.serviceValues.join(", "))
          .replace("{serviceAnalysis}", JSON.stringify(analysis))
      };
    } else {
      return {
        system: system,
        prompt: bodyPrompt.templates.template1
          .replace("{mainKeyword}", mainKeyword)
          .replace("{title}", title)
          .replace("{toc}", toc)
          .replace("{intro}", intro)
      };
    }
  }
}
};
