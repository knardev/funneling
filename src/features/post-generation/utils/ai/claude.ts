import { ApiResponse } from "../../types";

const CLAUDE_CONFIG = {
    API: {
      URL: "https://api.anthropic.com/v1/messages", // Claude API URL
      KEY: process.env.NEXT_PUBLIC_CLAUDE_API_KEY, // Claude API Key (보안을 위해 실제 키를 넣으세요)
      VERSION: "2023-06-01", // API 버전
      MODEL: "claude-3-5-sonnet-20241022", // 모델 이름
      MAX_TOKENS: 2000 // 최대 토큰 수
    }
  }

    export async function makeClaudeRequest<T>(
        prompt: string,
        system: string,
        responseTransformer?: (response: ApiResponse) => T
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
  
    try{
        const response = await fetch(CLAUDE_CONFIG.API.URL, { 
      method: 'POST',
      headers: headers as Record<string, string>,
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
        const errorText = await response.text();
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
      console.error('API 요청 오류:', error);
      throw error;
    }
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
      function tryParseJson(text: string): any {
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