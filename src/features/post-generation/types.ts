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

  optimizedTitles: {

    strict_structure: string[];

    creative_structure: string[];

    style_patterns: string[];

  };

  extractedTitles: string[];

}

export interface ImportanceTitles  {
  high: string[];
  middle: string[];
  low: string[];
};

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
  mainKeyword: string;
  persona: Persona;
  service_analysis: Analysis;
  content: Content;
  imagePrompts: ImagePrompts[];
  images: GeneratedImage[];
  updatedContent: string;
}
// // 섹션 정보를 담는 인터페이스 정의
// export interface Section {
//   order: number;
//   Tapname: string;
//   type: '인플루언서' | '인기주제' | '인기글' | '브랜드' | '블로그' | '기타';
//   titles: string[];
// }

export interface ImportanceTitles {
  high: string[];
  middle: string[];
  low: string[];
};

export interface SmartBlockItem {
  postTitle: string | null;
  rank: number;
}

export interface SmartBlock {
  type: string | null;
  items: SmartBlockItem[];
  moreButtonLink: string | null;
  moreButtonRawLink: string | null;
  index: number;
}

export interface PopularTopicItem {
  title: string | null;
  thumbnailImageUrl: string | null;
  detailSerpUrl: string | null;
}

export interface SerpData {
  smartBlocks: SmartBlock[];
}

export interface ScrapedTitle {
  rank: number;
  postTitle: string;
}

export interface ScrapingResult {
  index: number;
  type: string;
  scrapedtitle: ScrapedTitle[];
}

export interface subkeywordlist{
  relatedTerms: string[];
  autocompleteTerms: string[];
}

export type ScrapingResults = ScrapingResult[];


export * from './types';