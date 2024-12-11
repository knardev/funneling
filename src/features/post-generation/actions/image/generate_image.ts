"use server";
import { Keyword,Persona,Content } from "../../types";

export async function generateImage(
    keyword: Keyword,
    persona: Persona,
    content:Content,  
    imagePrompts:string
) 
    
    {
  // 응답 데이터
  return {
    images:images
  };
}
