export interface Keyword {
    keyword: string;
    subkeywords: string;
  }
  
  export interface Persona {
    service_industry: string;
    service_name: string;
    service_advantage: string;
  }

export interface Content {
    title: string;
    toc: string;
    intro: string;
    body: string;
    conclusion: string;
    }

export interface Image {
    imagePrompts: string;
    imageurl: string;
    section: string;
    position: string;
}
export * from './types';