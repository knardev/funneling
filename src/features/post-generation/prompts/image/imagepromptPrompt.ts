import { Analysis } from "../../types";

export const imagepromptPrompt = {
    system: `
   You are an expert in creating image prompts for blog content.
   Your role is to analyze and enhance blog sections by inserting relevan
   and high-quality English image prompts. Every sentence you generate should be clear,
   concise, and specific to ensure the best possible image generation results.
    
    **Prefill Json Response**
        {
      "updatedContent": "{JUST RETURN THE CONTENT WITH IMAGE PROMPTS INSERTED}",

      "image_prompts": {
          "1": "",
          "2": "",
          "3": "",
          "4": "",
          "5": "",
          "6": "",
          "7": "",
          "8": "",
          "9": "",
          "10": ""
    }
    }
    `,  
    template: `
    Analyze and enhance the following blog content by inserting up to 10 English image prompts naturally throughout the text based on context.
   The content structure and placeholders are as follows:
    
    {allcontent}
    
    ### Instructions:
    1. **Content Analysis for Image Placement**:
       - Thoroughly understand the content to identify optimal image placement opportunities
       - Analyze the content's theme, tone, and target audience to determine appropriate image styles
       - Note: This analysis is ONLY for determining optimal image prompt placement and style
       - DO NOT modify or reorganize the original content structure or text
    
    2. **Image Prompt Insertion**:
       - Insert up to 10 image prompts within the content
       - Each image prompt should be inserted as a placeholder in the format #[id], where id is a unique integer starting from 1
       - Ensure that no two image prompts are inserted consecutively
       - Maintain a consistent photography style across all image prompts
       - Limit images featuring people to approximately 40% of the total
       - IMPORTANT: Insert prompts at natural breaking points while preserving the original content structure
    
    3. **Image Prompt Requirements**:
       - Each prompt must follow the structure:
         {Main subject/scene}, {composition details}, {lighting}, {mood/atmosphere}, {photography style}, {additional details}, Korea
       - End each prompt with ", 대한민국"
       - Use the numbering format: #[1], #[2], #[3], etc.

    4. **Minimal Formatting Guidelines**:
       - You may ONLY add line breaks for readability
       - Add a single empty line between natural paragraph breaks
       - DO NOT modify, rewrite, or reorganize any content
       - DO NOT add any other formatting or structural changes
    
    5. **Output Format**:
       - **CRITICAL: Return ONLY a JSON object with exactly two keys:**
         1. "updatedContent": A SINGLE STRING containing:
            * The complete original content with image prompt placeholders
            * Minimal line breaks for readability
            * MUST maintain exact original content structure and text
            * MUST NOT reorganize sections or modify content
         2. "image_prompts": An object mapping each id to its corresponding image prompt
    
    ### Critical Requirements:
    - MAINTAIN EXACT ORIGINAL CONTENT: Do not modify, rewrite, or reorganize any content
    - PRESERVE STRUCTURE: Keep all sections (title, TOC, intro, body, conclusion) in their original order
    - MINIMAL CHANGES: Only add image prompts and necessary line breaks
    - FORMAT: Return a single JSON object containing only "updatedContent" and "image_prompts"
    `,
    generatePrompt: (
    allcontent: string,
    analysis?: Analysis
    ): string => {
      return imagepromptPrompt.template
        .replace("{allcontent}", allcontent)
        .replace("{analysis}", analysis ? JSON.stringify(analysis) : '');
    }
};