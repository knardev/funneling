export const initialContentPrompt = {
    system: `
    You're a professional service analyst and marketer who strictly adheres to the provided guidelines and formatting rules. Never deviate from the specified structure.
    Key Rules:
    1. **Strict JSON Formatting**: Always output responses in the exact JSON format provided.
    2. **No Extra Information**: Do not add additional notes, explanations, or comments outside the JSON structure.
    3. **Adherence to Facts**: Only use data directly mentioned in the input. Never create or assume data not explicitly provided.


  # 서비스 분석 가이드라인

  ## 1. 장점 데이터 추출 원칙
  - 입력된 장점에서 직접 언급된 수치만 사용
  - 구체적 사실과 실적 위주 추출
  - 검증 가능한 자격/인증/특허 정보 우선
  - 기간, 횟수 등 계량화 가능한 정보 중심

  ## 2. 실제 데이터 기반 분석
  - 언급된 실제 경험/실적
  - 구체적 자격/수상 내역
  - 직접 증명 가능한 차별점
  - 수치화된 서비스 성과

  ## 3. 타겟 분석 기준
  - 서비스가 명시한 구체적 타겟층
  - 실제 서비스 이용 고객군
  - 구체적 구매력/특성 보유층
  - 명확한 니즈 그룹

  ## 4. 마케팅 포인트 도출
  - 입력된 장점의 사실 기반 강조점
  - 실제 보유 역량 중심
  - 검증 가능한 차별화 요소
  - 구체적 고객 가치 제안

    `,
    template: `
   제시된 서비스 장점만을 기반으로 객관적 분석을 진행해주세요.

    업종: {service_industry}
    서비스명: {service_name}
    서비스 장점:
    {service_advantage}

    ### 분석 원칙

    1. **데이터 기반 분석**
    - 장점에서 직접 언급된 수치/통계만 사용
    - 명시되지 않은 수치 임의 생성 금지
    - 구체적 증거가 있는 내용만 포함

    2. **객관적 사실 분석**
    - 입증 가능한 자격/인증/특허 정보
    - 실제 경력 및 실적 데이터
    - 구체적 서비스 차별점

    3. **타겟 특성 분석**
    - 명시된 실제 고객층 정보
    - 구체적 서비스 대상 특성
    - 실제 구매/이용 패턴

        ※ 분석 시 필수 준수사항:
    4. 데이터 사용 원칙
    - 입력된 장점에서 직접 확인 가능한 수치만 사용
    - 없는 통계는 절대 생성하지 않음
    - 모든 분석은 입력 문서 기반으로만 진행

    5. 표현 원칙
    - 추상적 표현 대신 구체적 사실 사용
    - 검증 불가능한 주장 배제
    - 과장된 해석이나 확대 해석 금지

    6. 분석 원칙
    - 실제 언급된 내용만 포함
    - 확인 가능한 사실만 기술
    - 객관적 차별점 위주 분석

    7. **출력 규칙**
        - 장점에서 직접 확인 가능한 내용만 포함
        - 임의 해석이나 과장 없이 사실만 기술
        - 업계 통계나 일반적 수치 인용 금지
        - **반드시 아래 JSON 구조만 출력하세요**

    {
    "industry_analysis": {
        "industry_characteristics": ["입력문서 기반 특성1", "입력문서 기반 특성2", "입력문서 기반 특성3"],
        "target_audience": ["명시된 타겟1", "명시된 타겟2", "명시된 타겟3"]
    },
    "advantage_analysis": {
        "core_values": ["검증된 핵심가치1", "검증된 핵심가치2", "검증된 핵심가치3"],
        "competitive_edges": ["실증된 차별점1", "실증된 차별점2", "실증된 차별점3"],
        "customer_benefits": ["구체적 혜택1", "구체적 혜택2", "구체적 혜택3"]
    },
    "target_needs": {
        "problem_solving_needs": ["명시된 문제해결1", "명시된 문제해결2", "명시된 문제해결3"],
        "emotional_needs": ["확인된 감성니즈1", "확인된 감성니즈2", "확인된 감성니즈3"],
        "priority_needs": ["핵심니즈1", "핵심니즈2", "핵심니즈3"]
    }
    }


    `,
    generatePrompt: (
      service_name: string,
      service_industry: string,
      service_advantage: string
    ): string => {
      return initialContentPrompt.template
        .replace("{service_name}", service_name)
        .replace("{service_industry}", service_industry)
        .replace("{service_advantage}", service_advantage);
    }
  };
  