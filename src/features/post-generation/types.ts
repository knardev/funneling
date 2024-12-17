export interface KeywordObj {
    mainKeyword: string;
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
  }

export interface Content {
    title: string;
    toc: string[];
    intro: string;
    body: string;
    conclusion: string;
    }


export interface ApiResponse {
  apiResponse: string;
}


export interface TitleResponse {
  selected_subkeywords: string[];
  optimizedTitles: string[]; // 하나의 배열로 변경
}

export interface PredictionInput {
  id: string;
  prompt: string;
}
// 예측 응답 인터페이스
export interface PredictionResponse {
  output: string[];
  uuid: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  urls: {
    get: string;
  };
  error?: {
    message: string;
  };
}

export interface ImagePrompts {
  id: string;
  prompt: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
}

export interface FinalResult {
  keywords: KeywordObj;
  persona: Persona;
  service_analysis: Analysis;
  content: Content;
  imagePrompts: ImagePrompts[];
  images: GeneratedImage[];
  updatedContent: string;
}


export * from './types';