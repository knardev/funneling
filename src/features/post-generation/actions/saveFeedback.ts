"use server";

import { createClient } from "@supabase/supabase-js";

import { Database } from "../../../../database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function saveFeedback(feedback: string) {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  const feedbackData: Database['public']['Tables']['feedback']['Insert'] = {
    feedback: feedback,
  };

  const { error } = await supabase.from('feedback').insert(feedbackData);
  if (error) {
    throw new Error('Failed to save feedback');
  }
}
