"use server";

import {naverUtils} from "../utils/naver";
import { Analysis, ApiResponse, Persona } from "../types";
import { makeClaudeRequest } from "../utils/ai/claude";
import { initialContentPrompt } from "../prompts/initialcontentPrompt";

export async function initializeContent(
    keyword: string,
    persona?: Persona
  ):Promise<{
    service_analysis?: Analysis;
    subkeywordlist: string[];
  }>
  {
  // 필수 데이터 확인
  if (!keyword) {
    throw new Error('키워드는 필수 데이터입니다.');
  }

  // 서비스 분석 데이터 생성
const serviceAnalysis: Analysis = persona ? await analyzeService(persona) : {
  industry_analysis: "",
  advantage_analysis: "",
  target_needs: "",
  marketing_points: ""
};


  // 검색 데이터 생성
  const subkeywordlist:string[] = await getSearchData(keyword);

  // 응답 데이터
  return {
      service_analysis: serviceAnalysis,
      subkeywordlist: subkeywordlist
  };
}


const { fetchGeneralSearch, fetchAutocomplete } = naverUtils;



//html은 가져오는데 연관 검색어 추출을 못함

// 검색 데이터 생성 함수
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
  const autocompleteTerms = processAutocomplete(keyword);
  const subkeywords = relatedTerms.concat(await autocompleteTerms)

  return subkeywords;
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



const removeHTMLTags = (text: string) => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/,\s*,/g, ', ')
    .trim();
};

export async function extractAutocomplete(keyword: string) {
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



async function analyzeService(persona: Persona ):Promise<Analysis> {

  const analysis = await makeClaudeRequest<ApiResponse>(
    initialContentPrompt.generatePrompt(
    persona.service_name,
    persona.service_industry, 
    persona.service_advantage
  ),
    initialContentPrompt.system,
    (response: ApiResponse) => ({
      ...extractJsonFromResponse(response),
      apiResponse: response.apiResponse
    })
  );

  const analysisresult=extractJsonFromResponse(analysis)


  return {
    industry_analysis: analysisresult.industry_analysis,
    advantage_analysis: analysisresult.advantage_analysis,
    target_needs: analysisresult.target_needs,
    marketing_points: analysisresult.marketing_points
  };
}


function extractJsonFromResponse(response: ApiResponse): Analysis {
  try {
    const jsonMatch = response.apiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const jsonText = jsonMatch[0];
    const parsedData:Analysis = JSON.parse(jsonText);


    return {
      industry_analysis: parsedData.industry_analysis || '',
      advantage_analysis: parsedData.advantage_analysis || '',
      target_needs: parsedData.target_needs || '',
      marketing_points: parsedData.marketing_points || ''
    }
  } catch (error) {
    console.error('Error extracting JSON:', error);
    throw new Error('Failed to extract JSON from response');
  }
}