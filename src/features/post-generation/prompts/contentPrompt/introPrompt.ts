import { Analysis } from "../../types";

export const introPrompt = {
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

      `,
      음슴체: ` 
      
      Use these ending variations for 음슴체:
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
    }`,
    },

    templates: {
      정중체: `
          
    \n\nHuman:
    다음 제목과 목차를 분석하고, YES-SET 기법을 사용하여 독자의 관심을 끌 수 있는 서론을 작성해줘. 
    분석 내용은 내부적으로 처리하고, 최종적으로 생성된 서론 1개만 출력하는거야. 서론은 독자의 니즈를 반영하고, 정중체로 매력적으로 작성되어야 해. 
    
      1. 메인 키워드: "{mainKeyword}"
      2. 제목: "{title}"
      3. 목차: "{toc}"
      4. 서비스분석: "{serviceAnalysis}"
    
    ### 작성 단계임
    
    1. **제목과 목차 분석**
       - 제목이 전달하는 메시지를 핵심적으로 단순화해서 분석하기
       - 목차를 분석해서 콘텐츠의 전체적인 흐름과 가치 파악하기
       - 독자가 얻을 수 있는 핵심 가치와 인사이트 도출하기
       - 제목+목차가 왜 독자의 관심을 끌었는지 분석하기
       - 클릭한 독자의 주요 궁금증이나 니즈 2-3개 뽑아내기
       - 감정적 연결과 신뢰성 확보가 되었는지 체크하기
    
    2. **YES-SET 구성**
       - 독자가 제목과 목차 내용에 "응" 하고 답할 수 있는 질문 2-3개 만들기
       - 질문은 독자의 니즈랑 감정적 연결을 반영해야 함
       - 정중체로 다양한 표현과 스타일 사용하기
         예시: "이런 경험 있으시죠?", "이거 나만 그런거 아니죠?", "같이 보러 가실 분 있으신가요?"
    
    3. **서론 작성 가이드**
       - YES-SET 질문을 활용해서 서론 작성하기
       - 음슴체로 통일감 있게 작성하기
       
       - 서론은 이런 방식 중에 하나로 다양하게 쓰기:
         - **상황 묘사:** "여러분도 이런 적 있으신가요? {구체적인 상황}"
         - **직접 정보:** "이거 진짜 꿀팁인데 알려드릴게요"
         - **의문 제기:** "이런 고민 있으신가요?"
         - **감정적 연결:** "솔직히 이거 혼자만 그런거 아니죠?"
         - **전문가형:** "전문가가 알려주는 진짜 팁이에요"
         - **유머러스:** "이거 보고 놀라지 마세요ㅋㅋㅋ"
         - **스토리텔링:** "그날이었어요. 대박 발견한..."
    
    4. **서론 작성 조건**
       - 모든 문장은 문장부호로 끝나야 함
       - 흥미를 확 끌수 있게 쓰기
       - 공감되는 내용 꼭 넣기
       - 줄바꿈으로 가독성 높이기
       - 구체적이고 생생한 표현 쓰기
       - 다양한 정중체 변형 활용하기 (예: ~입니다, ~하시죠)
       - 목차 분석 내용을 자연스럽게 녹여서 방향성 제시하기
       - 서비스 분석의 핵심 장점이나 차별점도 넣기
       
    5. **서론 생성 규칙**
        - 서론은 600~700자 이내로만 쓰기
        - 줄바꿈이나 탭은 \\n으로 처리하기
        - JSON 구조로만 출력하기. 다른 건 절대 쓰면 안 됩니다.
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
      음슴체: `
    
    \n\nHuman:
    다음 제목과 목차를 분석하고, YES-SET 기법을 사용하여 독자의 관심을 끌 수 있는 서론을 작성해줘. 
    분석 내용은 내부적으로 처리하고, 최종적으로 생성된 서론 1개만 출력하는거임. 서론은 독자의 니즈를 반영하고, 음슴체로 매력적으로 작성되어야 함.
    
      1. 메인 키워드: "{mainKeyword}"
      2. 제목: "{title}"
      3. 목차: "{toc}"
      4. 서비스분석: "{serviceAnalysis}"
    
    ### 작성 단계임
    
    1. **제목과 목차 분석**
       - 제목이 전달하는 메시지를 핵심적으로 단순화해서 분석하기
       - 목차를 분석해서 콘텐츠의 전체적인 흐름과 가치 파악하기
       - 독자가 얻을 수 있는 핵심 가치와 인사이트 도출하기
       - 제목+목차가 왜 독자의 관심을 끌었는지 분석하기
       - 클릭한 독자의 주요 궁금증이나 니즈 2-3개 뽑아내기
       - 감정적 연결과 신뢰성 확보가 되었는지 체크하기
    
    2. **YES-SET 구성**
       - 독자가 제목과 목차 내용에 "응" 하고 답할 수 있는 질문 2-3개 만들기
       - 질문은 독자의 니즈랑 감정적 연결을 반영해야 함
       - 음슴체로 다양한 표현과 스타일 사용하기
         예시: "이런 경험 있음?", "이거 나만 그런거 아님?", "같이 보러 갈사람?"
    
    3. **서론 작성 가이드**
       - YES-SET 질문을 활용해서 서론 작성하기
       - 음슴체로 통일감 있게 작성하기
       
       - 서론은 이런 방식 중에 하나로 다양하게 쓰기:
         - **상황 묘사:** "여러분도 이런 적 있음? {구체적인 상황}"
         - **직접 정보:** "이거 진짜 꿀팁인데 알려주는거임"
         - **의문 제기:** "이런 고민 있는 사람?"
         - **감정적 연결:** "솔직히 이거 혼자만 그런거 아닌데?"
         - **전문가형:** "전문가가 알려주는 진짜 팁임"
         - **유머러스:** "이거 보고 놀라지 말아야 함ㅋㅋ"
         - **스토리텔링:** "그날이었음. 대박 발견한..."
    
    4. **서론 작성 조건**
       - 모든 문장은 문장부호로 끝나야 함
       - 흥미를 확 끌수 있게 쓰기
       - 공감되는 내용 꼭 넣기
       - 줄바꿈으로 가독성 높이기
       - 구체적이고 생생한 표현 쓰기
       - 다양한 음슴체 변형 활용하기 (예: ~임, ~슴, ~는데)
       - 목차 분석 내용을 자연스럽게 녹여서 방향성 제시하기
       - 서비스 분석의 핵심 장점이나 차별점도 넣기
       
    5. **서론 생성 규칙**
        - 서론은 600~700자 이내로만 쓰기
        - 줄바꿈이나 탭은 \\n으로 처리하기
        - JSON 구조로만 출력하기. 다른 건 절대 쓰면 안 됨
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
  }`
    },
    generatePrompt: (
      mainKeyword: string,
      title: string,
      toc: string,
      tone: `정중체` | `음슴체`,
      analysis?: Analysis
    ): { system: string; prompt: string }  => {
      const system=introPrompt.systems[tone];
      if (!system) {
        throw new Error("Tone is required.");
      }
      const template = introPrompt.templates[tone];
      if (!template) {
        throw new Error("Template is required.");
      }
      const prompt = template
        .replace("{mainKeyword}", mainKeyword)
        .replace("{title}", title)
        .replace("{toc}", toc)
        .replace("{serviceAnalysis}", analysis ? JSON.stringify(analysis) : '');
    return { system, prompt };
      }
};