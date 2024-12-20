import { ApiResponse } from "../../types";

const OPENAI_CONFIG = {
  API: {
    URL: "https://api.openai.com/v1/chat/completions",
    KEY: process.env.OPENAI_API_KEY,
    MODEL: "gpt-4o",
    MAX_TOKENS: 6000,
  },
};

export async function makeOpenAiRequest<T>(
  prompt: string,
  system: string,
  responseTransformer?: (response: ApiResponse) => T,
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_CONFIG.API.KEY}`,
  };

  const payload = {
    model: OPENAI_CONFIG.API.MODEL,
    max_tokens: OPENAI_CONFIG.API.MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  };

  try {
    const response = await fetch(OPENAI_CONFIG.API.URL, {
      method: "POST",
      headers: headers as Record<string, string>,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorDetails}`,
      );
    }

    const result = await response.json();

    if (!result.choices?.[0]?.message?.content) {
      throw new Error("No content found in the response");
    }

    try {
      // 응답 텍스트 정리
      const cleanedContent = cleanJsonString(result.choices[0].message.content);

      const parsedContent = JSON.parse(cleanedContent);
      console.log("Parsed Content:", JSON.stringify(parsedContent));

      if (responseTransformer) {
        return responseTransformer(parsedContent);
      }

      return parsedContent as T;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Failed to parse text:", result.choices[0].message.content);
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error("Error in API request:", error);
    throw error;
  }
}

/**
 * 코드 블록과 불필요한 문자를 제거하는 함수
 */
function cleanJsonString(str: string): string {
  // 코드 블록 표시 제거
  let cleaned = str.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  // 앞뒤 공백 제거
  cleaned = cleaned.trim();

  return cleaned;
}
