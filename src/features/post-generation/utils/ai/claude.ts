import { ApiResponse } from "../../types";

const CLAUDE_CONFIG = {
  API: {
    URL: "https://api.anthropic.com/v1/messages", // Claude API URL
    KEY: process.env.CLAUDE_API_KEY, // Claude API Key
    VERSION: "2023-06-01", // API 버전
    MODEL: "claude-3-5-sonnet-20241022", // 모델 이름
    MAX_TOKENS: 4000 // 최대 토큰 수
  }
};

/**
 * 내부 문자열 값에서 이스케이프되지 않은 큰따옴표를 찾아서 올바르게 이스케이프하는 함수.
 * 정규표현식을 이용하여 " : " 로 시작하는 문자열 내부만 대상으로 합니다.
 */
function repairUnescapedQuotes(str: string): string {
  // 이 정규표현식은 colon과 공백 후에 시작하는 문자열 값을 찾아서 내부의 미이스케이프된 큰따옴표를 이스케이프합니다.
  return str.replace(/(:\s*")((?:\\.|[^"\\])*)((?="))/g, (match, prefix, innerContent) => {
    // innerContent 내에서 이미 이스케이프되지 않은 " 를 찾아서 이스케이프 처리
    const repairedContent = innerContent.replace(/(?<!\\)"/g, '\\"');
    return prefix + repairedContent;
  });
}

/**
 * 주어진 문자열을 JSON.parse 시도하고, 실패하면
 * trailing comma, 미이스케이프된 큰따옴표 등 흔한 오류를 보정해서 다시 파싱하는 헬퍼 함수.
 */
function tryParseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    // trailing comma 등 간단한 오류 보정
    let repaired = str
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    // 미이스케이프된 큰따옴표 보정 추가
    repaired = repairUnescapedQuotes(repaired);
    return JSON.parse(repaired);
  }
}

/**
 * 응답 텍스트에서 유효한 JSON 부분을 추출하여 파싱하는 fallback 함수.
 */
function extractJsonFromResponse(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    console.error('유효한 JSON 블록을 찾을 수 없습니다. 원본 텍스트:', text);
    throw new Error('유효한 JSON 블록을 찾을 수 없습니다.');
  }
  const jsonString = text.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    const sanitized = sanitizeJsonString(jsonString);
    try {
      return JSON.parse(sanitized);
    } catch (e2) {
      console.error('JSON 파싱 실패:', e2);
      console.log('원본 JSON 문자열:', jsonString);
      throw new Error('JSON 응답 파싱 실패');
    }
  }
}

function sanitizeJsonString(str: string): string {
  return str
    .replace(/[\u0000-\u001F]+/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Claude API의 응답 텍스트에서 content 배열의 첫번째 요소의 text 부분만 추출하여
 * 유효한 JSON으로 파싱한 결과를 반환하는 함수.
 */
export async function makeClaudeRequest<T>(
  prompt: string,
  system: string,
  responseTransformer?: (response: ApiResponse) => T,
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
        if (response.status === 529 || response.status >= 500) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`상태 ${response.status}, ${delay}ms 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`HTTP 오류! 상태: ${response.status}, 내용: ${errorText}`);
      }

      // 응답을 text로 받아 원본 텍스트를 로그에 출력
      const rawResponseText = await response.text();
      console.log("Claude Raw Response:", rawResponseText);

      let parsedContent: any;
      try {
        const rawJson = JSON.parse(rawResponseText);
        if (
          rawJson &&
          Array.isArray(rawJson.content) &&
          rawJson.content.length > 0 &&
          typeof rawJson.content[0].text === "string"
        ) {
          const innerText = rawJson.content[0].text;
          try {
            parsedContent = tryParseJson(innerText);
          } catch (e) {
            console.error("내부 JSON 파싱 오류:", e);
            // 파싱에 실패하면 innerText를 그대로 반환하지 않고, fallback 처리
            parsedContent = extractJsonFromResponse(rawResponseText);
          }
        } else {
          parsedContent = extractJsonFromResponse(rawResponseText);
        }
      } catch (e) {
        parsedContent = extractJsonFromResponse(rawResponseText);
      }

      if (responseTransformer) {
        return responseTransformer(parsedContent);
      }
      return parsedContent as T;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`에러 발생, ${delay}ms 후 재시도... 에러:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error('모든 재시도 실패:', error);
      throw new Error(`API 요청 실패 (${maxRetries}회 시도 후): ${lastError?.message}`);
    }
  }

  throw lastError || new Error('알 수 없는 에러');
}
