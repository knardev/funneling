"use server";

import { Keyword,Persona } from "../../types";


export async function generateIntro(
    keyword: Keyword,
    title: string,
    persona: Persona,
    toc:string) 
    {


  // 응답 데이터
  return {
    intro:intro
  };
}
