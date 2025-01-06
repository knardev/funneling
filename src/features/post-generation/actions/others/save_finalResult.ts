"use server";

import { createClient } from "@supabase/supabase-js";
import { FinalResult } from "../../types";
import { Database } from "../../../../../database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function saveFinalResult(
  finalResult: FinalResult
) {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  const tocString = finalResult.content.toc.join(',');

  try {
    // 1. post_generations 테이블에 데이터 삽입
    const postGenerationData: Database['public']['Tables']['post_generations']['Insert'] = {
      keyword: finalResult.mainKeyword,
      service_name: finalResult.persona.service_name || null,
      service_industry: finalResult.persona.service_industry || null,
      service_advantage: finalResult.persona.service_advantage || null,
      industry_analysis: finalResult.service_analysis.industry_analysis || null,
      advantage_analysis: finalResult.service_analysis.advantage_analysis || null,
      target_needs: finalResult.service_analysis.target_needs || null,
      title: finalResult.content.title,
      toc: tocString,
      intro: finalResult.content.intro,
      body: finalResult.content.body,
      conclusion: finalResult.content.conclusion,
      updated_content: finalResult.updatedContent,
    };

    const { data: postData, error: postError } = await supabase
      .from('post_generations')
      .insert(postGenerationData)
      .select();

    if (postError) {
      console.error("Supabase post_generations insert error:", postError);
      throw postError;
    }

    const postGeneration = postData[0];
    const postGenerationId = postGeneration.id; // UUID

    // 2. images 테이블에 데이터 삽입 준비
    const imagePrompts = finalResult.imagePrompts; // [{id: string, prompt: string}, ...]
    const images = finalResult.images; // [{id: string, imageUrl: string}, ...]

    // imagePrompts와 images를 id로 매칭
    const imagesToInsert = imagePrompts.map(prompt => {
      const correspondingImage = images.find(img => img.id === prompt.id);
      if (!correspondingImage) {
        throw new Error(`Image URL not found for image_id ${prompt.id}`);
      }
      return {
        post_generations_id: postGenerationId,
        image_id: parseInt(prompt.id), // image_id를 정수로 변환
        prompt: prompt.prompt,
        image_url: correspondingImage.imageUrl,
      };
    });

    // 3. images 테이블에 데이터 삽입
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .insert(imagesToInsert)
      .select();

    if (imagesError) {
      console.error("Supabase images insert error:", imagesError);
      throw imagesError;
    }
    console.log("All data inserted successfully:");
    // 4. 결과 반환 (선택 사항)
    return {
      postGeneration,
      images: imagesData,
    };
    
  } catch (error) {
    console.error("Error in saveFinalResult:", error);
    throw error;
  }
}
