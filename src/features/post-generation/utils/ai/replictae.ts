//// config.ts
import { PredictionInput, PredictionResponse, ApiResponse } from "../../types";

export const REPLICATE_CONFIG = {
    API: {
      BASE_URL: "https://api.replicate.com/v1/models/black-forest-labs/flux-dev", 
      PREDICTIONS_ENDPOINT: "/predictions",
      KEY: process.env.REPLICATE_API_TOKEN, // 환경 변수에서 API 키 불러오기
      MODEL: "black-forest-labs/flux-dev", // 모델 이름 (엔드포인트 URL에 반영)
      MAX_WAIT_TIME: 300000, // 최대 대기 시간 (밀리초) - 5분
      RETRY_DELAY: 5000, // 재시도 간격 (밀리초) - 5초
      MAX_RETRIES: 3, // 최대 재시도 횟수
    },
  };

export async function makeReplicateRequest(
  id:string,
  prompt: string,
): Promise<string> {
  const input: PredictionInput = {
    id,
    prompt,
  };

  try {
    // 예측 시작
    const prediction = await startPrediction(input.prompt);
    console.log(`예측 시작 ID: ${prediction.uuid}`);

    const imageUrl = await waitForResult(prediction);
    console.log("imageUrl", imageUrl)

    return imageUrl;
  } catch (error) {
    console.error("API 요청 오류:", error);
    throw error;
  }
}

async function makeRequest(
  url: string,
  method: "GET" | "POST",
  headers: Record<string, string>,
  payload: Record<string, object> | null = null
): Promise<PredictionResponse> {
  const options: RequestInit = {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  };

  const response = await fetch(url, options);
  const responseText = await response.text();
  let responseData: PredictionResponse;

  try {
    responseData = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error("응답 JSON 파싱 실패");
  }

  // 상태 코드 검증
  if (method === "POST") {
    if (response.status !== 201 || responseData.error) {
      throw new Error(responseData.error?.message || `API 요청 실패: 상태 코드 ${response.status}`);
    }
  } else if (method === "GET") {
    if (response.status !== 200 || responseData.error) {
      throw new Error(responseData.error?.message || `API 요청 실패: 상태 코드 ${response.status}`);
    }
  }

  return responseData;
}

/**
 * 예측 시작 함수
 * @param input 예측 입력 데이터
 * @returns 예측 응답 객체
 */
async function startPrediction(input: PredictionInput['prompt']): Promise<PredictionResponse> {
  const url = `${REPLICATE_CONFIG.API.BASE_URL}${REPLICATE_CONFIG.API.PREDICTIONS_ENDPOINT}`;
  const headers = {
    "Authorization": `Bearer ${REPLICATE_CONFIG.API.KEY}`,
    "Content-Type": "application/json",
    "Prefer": "wait"
  };

  const payload = {
    "input":{
      "prompt":input,
      "guidance":3.5
    }
  };

  const response = await makeRequest(url, "POST", headers, payload);
  return response as PredictionResponse;
}

/**
 * 결과 대기 함수
 * @param prediction 예측 응답 객체
 * @returns 예측 결과 출력 (예: 이미지 URL 배열)
 */
async function waitForResult(prediction: PredictionResponse): Promise<string> {
  const headers = {
    "Authorization": `Bearer ${REPLICATE_CONFIG.API.KEY}`,
  };

  const startTime = Date.now();
  let retryCount = 0;

  while (true) {
    if (Date.now() - startTime > REPLICATE_CONFIG.API.MAX_WAIT_TIME) {
      throw new Error("처리 시간 초과 (5분)");
    }

    try {
      // status 조회는 GET 요청
      const result = await makeRequest(prediction.urls.get, "GET", headers) as PredictionResponse;

      switch (result.status) {
        case "succeeded":
          console.log("Prediction succeeded.", result);
          if (result.output && Array.isArray(result.output) && result.output.length > 0) {
            // result.output에 이미지 URL이 있을 경우 여기서 반환
            // 해당 모델 문서 참조 필요
            return result.output[0]; 
          }
          throw new Error("이미지 생성은 성공했으나 결과가 없습니다.");
        case "failed":
          throw new Error(`이미지 생성 실패: ${result.error?.message || "알 수 없는 오류"}`);
        case "canceled":
          throw new Error("이미지 생성이 취소됨");
        default:
          console.log(`대기 중... 현재 상태: ${result.status}`);
          await delay(10000); // 10초 대기 후 재시도
      }
    } catch (error) {
      if (++retryCount > REPLICATE_CONFIG.API.MAX_RETRIES) {
        throw error;
      }
      console.warn(`재시도 ${retryCount}/${REPLICATE_CONFIG.API.MAX_RETRIES} - 오류: ${error}`);
      await delay(REPLICATE_CONFIG.API.RETRY_DELAY);
    }
  }
}

/**
 * 지연 함수 (밀리초 단위)
 * @param ms 지연 시간
 * @returns Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
