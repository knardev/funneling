export interface KeywordObj {
    mainKeyword: string;
    subkeywords: string[];
  }
  
export interface Profile {
    bizName: string;
    bizValue: string;
  }
  export interface AnalysisResults {
    needs: string[];
    priority: number;
    matchingServiceValue: string[];
  }
  

  export interface BrandPanelInputProps {
    // 프로필 관련
    profiles: { id: string; name: string; bizValues: BizValueSegment[] }[];
    selectedProfileId: string;
    handleSelectProfile: (id: string) => void;
    // 입력 상태
    mainkeyword: string;
    setMainKeyword: (value: string) => void;
    title: string;
    setTitle: (value: string) => void;
    topic: string;
    setTopic: (value: string) => void;
    serviceName: string;
    setServiceName: (value: string) => void;
    serviceValues: string[];
    setServiceValues: (value: string[]) => void;
    // 진행도 / 상태
    progress: number;
    progressMessage: string;
    isContentGenerated: boolean;
    isUpdatedContentExist: boolean;
    // 새로 추가: generationStep와 toc (수정된 목차)
    generationStep: number;
    toc: string;
    // 핸들러
    handleGenerateContent: () => void;
    handleGenerateImagePromptAndImages: () => void;
  }

export type ToneType = `정중체` | `음슴체`;

export interface Content {
    intro: string;
    body: string;
    conclusion: string;
    }


export interface ApiResponse {
  apiResponse: string;
}

export interface BizValueSegment {
  order: number; // 입력 순서 (번호)
  value: string; // 사용자가 입력한 업장 가치
}

export interface ProfileType {
  id: string;
  name: string;
  bizValues: BizValueSegment[]; // 불렛 형태로 입력받은 업장 가치 목록
}
export interface BrnadContent {
  topic: string;
  serviceName: string;
  serviceValues: string[];
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

export interface TitleResult{
    keyword: string;
    strict_structure: string[];
    creative_structure: string[];
    style_patterns: string[];
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
export interface Analysis{
  needs:[];
  priority:number;
  matchingServiceValue:[];
}
// src/types.ts

export interface VertexAIImageResponse {
  images?: { url: string }[]; // 현재 사용되지 않으므로 삭제 가능
  output?: string; // Base64 인코딩된 이미지 데이터
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
  title: string;
  toc: string;
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

export interface ProgressBarProps {
    progress: number;
    message: string;
  }

export * from './types';