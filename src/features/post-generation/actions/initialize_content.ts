"use server";

import {naverUtils} from "../utils/naver";
import { Keyword,Persona} from "../types";

export async function initializeContent(keyword: Keyword, persona: Persona) {

  // 필수 데이터 확인
  if (!keyword) {
    throw new Error('키워드는 필수 데이터입니다.');
  }


  // 서비스 분석 데이터 생성
  const serviceAnalysis = persona ? analyzeService(persona) : {};

  // 검색 데이터 생성
  const subkeywords = getSearchData(keyword);

  // 응답 데이터
  return {
    service_analysis: serviceAnalysis,
    subkeywords: subkeywords,
  };
}


const { fetchGeneralSearch } = naverUtils;


//html은 가져오는데 연관 검색어 추출을 못함

// 검색 데이터 생성 함수
 async function getSearchData(keyword: string) {
  console.log("getSearchData 시작 -키워드:", keyword);
  const html = await fetchGeneralSearch(keyword);
  console.log('HTML 데이터 받음, 길이:', html.length);
  
  const processSearchTerms = (html: string) => {
      console.log('processSearchTerms 시작');
      const searchTerms = extractRelatedSearchTerms(html);
      console.log('추출된 연관 검색어:', searchTerms);
      const processed = searchTerms.map(removeHTMLTags);
      console.log('HTML 태그 제거 후 연관 검색어:', processed);
      return processed;
    }
  

    const processAutocomplete = (html: string) => {
      console.log('processAutocomplete 시작');
      const autocomplete = extractAutocomplete(html);
      console.log('추출된 자동완성:', autocomplete);
      const processed = autocomplete.map(removeHTMLTags);
      console.log('HTML 태그 제거 후 자동완성:', processed);
      return processed;
    }

  const relatedTerms = processSearchTerms(html);
  const autocompleteTerms = processAutocomplete(html);

  return {
    related_terms: relatedTerms,
    autocomplete: autocompleteTerms
  };
}

const extractRelatedSearchTerms = (html: string) => {
  const relatedTerms: string[] = [];

  try {
    // related_srch 내의 lst_related_srch를 찾음
    const relatedSrchPattern = /<ul class="lst_related_srch[^"]*"[\s\S]*?<\/ul>/g;
    const relatedSrchMatch = html.match(relatedSrchPattern);

    if (relatedSrchMatch) {
      const listHtml = relatedSrchMatch[0];
      // 모든 item 클래스를 찾음
      const itemPattern = /<li class="item"[\s\S]*?<div class="tit">([\s\S]*?)<\/div>/g;
      let itemMatch;

      // 모든 item의 tit 내용을 추출
      while ((itemMatch = itemPattern.exec(listHtml)) !== null) {
        const term = itemMatch[1].trim();
        if (term) {
          relatedTerms.push(term);
        }
      }
    }

    return relatedTerms;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return relatedTerms;
  }
};

const extractAutocomplete = (html: string) => {
  const keywords: string[] = [];

  try {
    // fds-keyword-text를 포함하는 span 태그를 찾는 정규식
    const regex = /<span[^>]*class=["'][^"']*fds-keyword-text[^"']*["'][^>]*>(.*?)<\/span>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const text = match[1].trim();
      if (text) {
        keywords.push(text);
      }
    }

    return keywords;
  } catch (error) {
    console.error('키워드 추출 중 오류 발생:', error);
    return keywords;
  }
};

const removeHTMLTags = (text: string) => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/,\s*,/g, ', ')
    .trim();
};

 function analyzeService(persona: any) {
    return {
      industry_analysis: `${persona.service_industry} 산업에 대한 분석 내용...`,
      advantage_analysis: `${persona.service_advantage}의 장점 분석...`,
      target_needs: '타겟 고객의 요구 사항 분석...',
    };
  }