// // src/imagen3.ts

// import { PredictionServiceClient } from "@google-cloud/aiplatform";
// import * as fs from "fs";
// import * as path from "path";
// import fetch from "node-fetch";
// import { VertexAIImageResponse } from "../../types";

// /**
//  * Vertex AI를 사용하여 이미지 생성 요청을 보내는 함수
//  * @param id 고유 ID (필요 시 사용)
//  * @param prompt 이미지 생성을 위한 프롬프트
//  * @returns 생성된 이미지의 로컬 경로
//  */
// export async function makeImagenRequest(id: string, prompt: string): Promise<string> {
//   const projectId = process.env.PROJECT_ID;
//   const location = process.env.LOCATION || "us-central1";
//   const endpointId = process.env.ENDPOINT_ID;

//   if (!projectId) {
//     throw new Error("프로젝트 ID가 설정되지 않았습니다.");
//   }

//   if (!endpointId) {
//     throw new Error("Endpoint ID가 설정되지 않았습니다.");
//   }

//   const client = new PredictionServiceClient();

//   // Vertex AI의 예측 엔드포인트 경로 생성
//   const endpointPath = client.endpointPath(projectId, location, endpointId);

//   // 예측 요청 구성
//   const request = {
//     endpoint: endpointPath,
//     instances: [
//       {
//         prompt: prompt,
//       },
//     ],
//     parameters: {
//       temperature: 0.7, // 생성 다양성 제어
//       maxOutputTokens: 512, // 생성 최대 토큰 수
//       // 필요에 따라 추가 파라미터 설정
//     },
//   };

//   try {
//     // 예측 요청 보내기
//     const [response] = await client.predict(request);

//     // 예측 응답에서 이미지 데이터 추출
//     const prediction = response.predictions?.[0] as VertexAIImageResponse;
//     const imageData = prediction?.output;

//     if (imageData) {
//       // Base64 인코딩된 이미지 데이터에서 헤더 제거
//       const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
//       const buffer = Buffer.from(base64Data, "base64");
//       const imagePath = path.join(__dirname, "generated_image.png");
//       fs.writeFileSync(imagePath, buffer);
//       console.log("이미지가 로컬에 저장되었습니다:", imagePath);
//       return imagePath;
//     } else {
//       throw new Error("이미지 데이터를 가져오지 못했습니다.");
//     }
//   } catch (error) {
//     console.error("이미지 생성 중 오류 발생:", error);
//     throw error;
//   }
// }

// // 테스트용 함수 호출 (필요 시 제거)
// const testPrompt = "A photorealistic image of a cookbook laying on a wooden kitchen table, the cover facing forward featuring a smiling family sitting at a similar table, soft overhead lighting illuminating the scene, the cookbook is the main focus of the image.";
// const uniqueId = "test-id-123";

// makeImagenRequest(uniqueId, testPrompt)
//   .then((imagePath) => {
//     console.log("최종 이미지 경로:", imagePath);
//   })
//   .catch((error) => {
//     console.error("이미지 생성 실패:", error);
//   });
