"use server";

import { Keyword, Persona } from "../../types";


export async function generateConclusion(
    keyword: Keyword,
    persona: Persona,
    title: string,
    toc:string,
    intro:string,
    body:string
) 
    
    {

  // 응답 데이터
  return {
    conclusion:conclusion
  };
}
