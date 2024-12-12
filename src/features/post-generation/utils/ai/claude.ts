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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if(!result.content?.[0]?.text) {
            throw new Error('No content found in the response');
        }

        try {
            const parsedContent = await JSON.parse(result.content[0].text);
            console.log('Parsed Content:', parsedContent);
      
            if (responseTransformer) {
              return responseTransformer(parsedContent);
            }
      
            return parsedContent as T;
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.log('Failed to parse text:', result.content[0].text);
            throw new Error('Failed to parse API response');
          }
      
        } catch (error) {
          console.error('Error in API request:', error);
          throw error;
        }
      }