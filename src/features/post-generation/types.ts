export interface KeywordObj {
    keyword: string;
    subkeywords: string[];
  }
  
  export interface Persona {
    service_name: string;
    service_industry: string;
    service_advantage: string;
  }
  export interface Analysis {
    industry_analysis: string | null;
    advantage_analysis: string | null;
    target_needs: string | null;
    marketing_points: string | null;
  }

export interface Content {
    title: string;
    toc: string;
    intro: string;
    body: string;
    conclusion: string;
    }


export interface ApiResponse {
  apiResponse: string;
}


export interface TitleResponse {
  title: string;
  subkeywords: string[];
}

export interface PredictionInput {
  id: string;
  prompt: string;
}
// 예측 응답 인터페이스
export interface PredictionResponse {
  uuid: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  urls: {
    get: string;
  };
  error?: {
    message: string;
  };
}

export * from './types';