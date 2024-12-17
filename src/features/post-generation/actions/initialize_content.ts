"use server";

import {naverUtils} from "../utils/naver";
import { Analysis, Persona } from "../types";
import { makeClaudeRequest } from "../utils/ai/claude";
import { initialContentPrompt } from "../prompts/initialcontentPrompt";

export async function initializeContent(
    keyword: string,
    persona?: Persona
  ):Promise<{
    serviceanalysis?: Analysis;
    subkeywordlist: string[];
  }>
{
  if (!keyword) {
    throw new Error('키워드는 필수 데이터입니다.');
  }

  const subkeywordlist:string[] = await getSearchData(keyword);
  const response = { subkeywordlist};
  
  if(persona){
    const serviceanalysis = await analyzeService(persona);
    return {subkeywordlist, serviceanalysis};
  }

  console.log("initializeContent 응답 데이터", JSON.stringify(response));
  return response;
}

const { fetchGeneralSearch, fetchAutocomplete } = naverUtils;



const extractRelatedSearchTerms = (html: string) => {
  const relatedTerms: string[] = [];

  try {
    const relatedSrchPattern = /<ul class="lst_related_srch[^"]*"[\s\S]*?<\/ul>/g;
    const relatedSrchMatch = html.match(relatedSrchPattern);

    if (relatedSrchMatch) {
      const listHtml = relatedSrchMatch[0];
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

const removeHTMLTags = (text: string) => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/,\s*,/g, ', ')
    .trim();
};

async function getSearchData(keyword: string) {
  console.log("getSearchData 시작 -키워드:", keyword);
  const html1 = await fetchGeneralSearch(keyword);
  console.log('HTML 데이터 받음, 길이:', html1.length);
  
  const processRelatedTerms = (html1: string) => {
    console.log('processRelatedTerms 시작');
    const relatedTerms = extractRelatedSearchTerms(html1);
    const processed = relatedTerms.map(removeHTMLTags);
    console.log('HTML 태그 제거 후 연관 검색어:', processed);
    return processed;
  }

  const processAutocomplete = async (keyword: string) => {
    const autocomplete = await extractAutocomplete(keyword);
    const processed = autocomplete.map(removeHTMLTags);
    console.log('HTML 태그 제거 후 자동완성:', processed);
    return processed;
  }

  const relatedTerms = processRelatedTerms(html1);
  const autocompleteTerms = await processAutocomplete(keyword);
  const subkeywords = Array.from(new Set(relatedTerms.concat(autocompleteTerms)));

  return subkeywords;
}

async function extractAutocomplete(keyword: string) {
  if (!keyword) {
    console.error("Invalid or empty keyword provided.");
    return [];
  }

  try {
    let allResults = [];

    // 기본 키워드 자동완성 결과
    const mainResults = await fetchAutocomplete(keyword);
    if (mainResults && mainResults.length > 0) {
      allResults.push(...mainResults);
    }

    // 초성 ㄱ부터 ㅎ까지 생성
    const suffixes = Array.from({ length: 14 }, (_, i) => String.fromCharCode(0x3131 + i));

    // 확장 키워드 검색 (초성을 접미사로 추가)
    for (const suffix of suffixes) {
      const extendedResults = await fetchAutocomplete(`${keyword} ${suffix}`);
      if (extendedResults && extendedResults.length > 0) {
        allResults.push(...extendedResults);
      }
    }

    // 중복 제거 후 반환
    return Array.from(new Set(allResults));
  } catch (error) {
    console.error('Error in extractAutocomplete:', error);
    return [];
  }
}



async function analyzeService(persona: Persona): Promise<Analysis> {
  try {
    const response = await makeClaudeRequest<Analysis>(
      initialContentPrompt.generatePrompt(
        persona.service_name,
        persona.service_industry,
        persona.service_advantage
      ),
      initialContentPrompt.system,
    );

    console.log('Raw response from makeClaudeRequest:', response);

    return {
      industry_analysis: mergeArrays(response.industry_analysis),
      advantage_analysis: mergeArrays(response.advantage_analysis),
      target_needs: mergeArrays(response.target_needs)
    };
  } catch (error) {
    console.error('Error in analyzeService:', error);
    throw error;
  }
}

function mergeArrays(section: string | null): string {
  if (!section || typeof section !== 'object') {
    return '';
  }

  return Object.values(section)
    .flat()
    .filter((item): item is string => typeof item === 'string')
    .join('\n');
}