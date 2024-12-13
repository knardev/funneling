 "use server";

import { title } from "node:process";
import { TitleResponse, KeywordObj, Persona } from "../../types";
import { fetchBlogTitles } from "../../utils/naver";
import { titlePrompt } from "../../prompts/contentPrompt/titlePrompt";
import { makeOpenAiRequest } from "../../utils/ai/openai";

export async function generateTitle(
  keyword: KeywordObj,
  persona: Persona
):Promise<TitleResponse> {


  const mainkeyword = keyword.keyword
  const subkeyword = keyword.subkeywords

  const html1 = await fetchBlogTitles(mainkeyword)
  const extractedText = await extractTextAfterTitleArea(html1)

  const extratedTitles: string[] = limitTextArray(extractedText)
  console.log(extratedTitles)
  const topKeywords= extractTopKeywords(extratedTitles)

  const highImportanceTitles=extratedTitles.slice(0,3)
  const lowImportanceTitles=extratedTitles.slice(3)

  const totalSubkeywords=topKeywords.concat(subkeyword)

  const response=await makeOpenAiRequest<{
    optimized_title:string,
    selected_subkeywords:string[];
  }>(
    titlePrompt.generatePrompt(
      mainkeyword,
      highImportanceTitles,
      lowImportanceTitles,
      totalSubkeywords
    ),
    titlePrompt.system,
  )

  const title=response.optimized_title
  const subkeywords=response.selected_subkeywords
  
  // 응답 데이터
  console.log("generateTitle 응답 데이터",JSON.stringify({
    subkeywords: subkeywords,
    title: title
  }))
  return {
    subkeywords: subkeywords,
    title: title
  };
}


function extractTextAfterTitleArea(html: string): string[] {
  const regex: RegExp = /<div class="title_area">[\s\S]*?<a[^>]*>(.*?)<\/a>/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(html)) !== null) {
    let extractedText: string = match[1];
    
    // <mark> 태그를 { }로 변환
    extractedText = extractedText
      .replace(/<mark>/g, '{')
      .replace(/<\/mark>/g, '}');
      
    matches.push(extractedText.trim());
  }

  return matches;
}

function limitTextArray(texts: string[], limit: number = 8): string[] {
  return texts.slice(0, limit);
}

function extractTopKeywords(topTitles: string[]): string[] {
  const highImportanceTitles = topTitles.slice(0, 3).filter(Boolean);
  const words = highImportanceTitles.flatMap(title => title.match(/\b\w+\b/g) || []);
  
  const wordCounts = words.reduce((counts: Record<string, number>, word: string) => {
    if (word.length > 1) counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {});

  return Object.keys(wordCounts)
    .sort((a, b) => wordCounts[b] - wordCounts[a])
    .slice(0, 5);
}

