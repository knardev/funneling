"use server";

import { createClient } from "@supabase/supabase-js";
import { TitleResult } from "../../types";
import { Database } from "../../../../../database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function saveTitleResult(
  TitleResult: TitleResult
) {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  let strict_structure= TitleResult.strict_structure.join(",");
  let creative_structure= TitleResult.creative_structure.join(",");
  let style_patterns= TitleResult.style_patterns.join(",");


  try {
    // 1. post_generations 테이블에 데이터 삽입
    const postGenerationData: Database['public']['Tables']['titles']['Insert'] = {
        keyword: TitleResult.keyword,
        strict_structure: strict_structure,
        creative_structure: creative_structure,
        style_patterns
    };

    const { data: postData, error: postError } = await supabase
      .from('titles')
      .insert(postGenerationData)
      .select();

    if (postError) {
      console.error("Supabase post_generations insert error:", postError);
      throw postError;
    }

    const postGeneration = postData[0];
    const postGenerationId = postGeneration.id; // UUID



    console.log("All data inserted successfully:");
    // 4. 결과 반환 (선택 사항)
    return {
      postGeneration,
    };
    
  } catch (error) {
    console.error("Error in saveTitleResult:", error);
    throw error;
  }
}
