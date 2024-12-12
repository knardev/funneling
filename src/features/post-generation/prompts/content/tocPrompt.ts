export const tocPrompt = {
    system: `You are a professional content strategist who understands user search intent and information needs.`,
    template: `
    제목 "{title}"을 검색한 사용자들이 실제로 알고 싶어하는 정보들을 목차로 구성해주세요.
    
    [고려사항]
    1. 제목: "{title}"
    2. 메인 키워드: "{mainKeyword}"
    3. 서브 키워드: "{subkeywords}"
    
    목차 작성 원칙:
    - 제목을 검색한 사용자의 실제 궁금증/고민/니즈를 해결하는 내용으로 구성
    - 검색 의도를 파악하여 단순 정보 나열이 아닌, 실용적인 해결책 중심으로 구성
    - 사용자가 글을 끝까지 읽고 싶도록 호기심을 자극하는 순서로 배치
    - 각 목차는 구체적인 가치/혜택을 암시하는 문구로 작성
    - 최대 5개의 대주제로 한정하여 핵심 정보에 집중
    - 목차는 한글로 작성해야 합니다.
    - 각 목차는 독자가 얻을 수 있는 구체적인 가치나 혜택이 드러나도록 작성합니다.
    - **반드시 목차만 출력해야합니다.**
    
    출력 형식:
    목차
    
    1. [가장 시급한 궁금증/니즈를 해결하는 내용]
    
    2. [두 번째로 중요한 정보/해결책]
    
    3. [보충 설명이 필요한 핵심 내용]
    
    4. [실용적인 팁이나 적용 방법]
    
    5. [독자의 행동을 유도하는 결론]
    

    `,
    generatePrompt: (
      mainKeyword: string,
      subkeywords: string[],
      title:string
    ): string => {
      return tocPrompt.template
        .replace("{mainKeyword}", mainKeyword)
        .replace("{subkeywords}", subkeywords.join('\n'))
        .replace("{title}", title);
    }
  };