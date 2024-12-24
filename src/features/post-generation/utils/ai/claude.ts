

const CLAUDE_CONFIG = {
    API: {
      URL: "https://api.anthropic.com/v1/messages", // Claude API URL
      KEY: process.env.CLAUDE_API_KEY, // Claude API Key (보안을 위해 실제 키를 넣으세요)
      VERSION: "2023-06-01", // API 버전
      MODEL: "claude-3-5-sonnet-20241022", // 모델 이름
      MAX_TOKENS: 4000 // 최대 토큰 수
    }
  }

  export async function makeClaudeRequest<T>(
    prompt: string,
    system: string,
    responseTransformer?: (response: string) => T,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_CONFIG.API.KEY,
        "anthropic-version": CLAUDE_CONFIG.API.VERSION
    };

    const payload = {
        model: CLAUDE_CONFIG.API.MODEL,
        max_tokens: CLAUDE_CONFIG.API.MAX_TOKENS,
        system: system,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`API 요청 시도 ${attempt + 1}/${maxRetries}`);
            
            const response = await fetch(CLAUDE_CONFIG.API.URL, {
                method: 'POST',
                headers: headers as Record<string, string>,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                // 529 에러나 특정 상태 코드에 대해서만 재시도
                if (response.status === 529 || response.status >= 500) {
                    const delay = initialDelay * Math.pow(2, attempt); // 지수 백오프
                    console.log(`상태 ${response.status}, ${delay}ms 후 재시도...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                throw new Error(`HTTP 오류! 상태: ${response.status}, 내용: ${errorText}`);
            }

            const result = await response.json();

            if (!result.content?.[0]?.text) {
                throw new Error('응답에서 컨텐츠를 찾을 수 없습니다');
            }

            const content = result.content[0].text;
            const parsedContent = tryParseJson(content);

            if (responseTransformer) {
                return responseTransformer(parsedContent);
            }

            return parsedContent as T;

        } catch (error) {
            lastError = error as Error;
            
            // 마지막 시도가 아니라면 재시도
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`에러 발생, ${delay}ms 후 재시도... 에러:`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            // 마지막 시도였다면 에러를 throw
            console.error('모든 재시도 실패:', error);
            throw new Error(`API 요청 실패 (${maxRetries}회 시도 후): ${lastError?.message}`);
        }
    }

    // 이 부분은 실행되지 않지만 TypeScript를 위해 필요
    throw lastError || new Error('알 수 없는 에러');
}

      function sanitizeJsonString(str: string): string {
        return str
          .replace(/[\u0000-\u001F]+/g, '') // 제어 문자 제거
          .replace(/\n/g, '\\n')           // 개행 문자 이스케이프
          .replace(/\r/g, '\\r')           // 캐리지 리턴 이스케이프
          .replace(/\t/g, '\\t');          // 탭 문자 이스케이프
      }
      
      /**
       * JSON 파싱을 시도하는 함수
       */
      function tryParseJson(text: string): string {
        try {
          // 먼저 원본 텍스트로 시도
          return JSON.parse(text);
        } catch (e) {
          try {
            // 실패하면 정리된 텍스트로 다시 시도
            const sanitized = sanitizeJsonString(text);
            return JSON.parse(sanitized);
          } catch (e2) {
            console.error('JSON 파싱 실패:', e2);
            console.log('원본 텍스트:', text);
            throw new Error('JSON 응답 파싱 실패');
          }
        }
      }