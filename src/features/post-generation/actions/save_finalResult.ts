"use server";

import { createClient } from "@supabase/supabase-js";
import { FinalResult } from "../types";
import { Database } from "../../../../database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function saveFinalResult(
  finalResult: FinalResult
) {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    const insertData: Database['public']['Tables']['post_generations']['Insert'] = {
      keyword: finalResult.keywords.keyword,
      sub_keywrod: JSON.stringify(finalResult.keywords.subkeywords), // Note: matches the typo in the schema
      service_name: finalResult.persona.service_name || null,
      service_industry: finalResult.persona.service_industry || null,
      service_advantage: finalResult.persona.service_advantage || null,
      industry_analysis: finalResult.service_analysis.industry_analysis || null,
      advantage_analysis: finalResult.service_analysis.advantage_analysis || null,
      target_needs: finalResult.service_analysis.target_needs || null,
      title: finalResult.content.title,
      toc: Array.isArray(finalResult.content.toc) 
        ? JSON.stringify(finalResult.content.toc) 
        : finalResult.content.toc,
      intro: finalResult.content.intro,
      body: finalResult.content.body,
      conclusion: finalResult.content.conclusion,
      image_prompts: JSON.stringify(finalResult.imagePrompts),
      images: JSON.stringify(finalResult.images),
      updated_content: finalResult.updatedContent,
    };

    const { data, error } = await supabase
      .from('post_generations')
      .insert(insertData)
      .select();

    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in saveFinalResult:", error);
    throw error;
  }
}