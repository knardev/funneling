import { Analysis } from "../../types";

export const imagepromptPrompt = {
    system: `
   You are an expert in creating image prompts for blog content.
   Your role is to analyze and enhance blog sections by inserting relevant
   and high-quality English image prompts. Every sentence you generate should be clear,
   concise, and specific to ensure the best possible image generation results.
    
    **Prefill Json Response**
        {
      "updatedContent": "{JUST RETURN THE CONTENT WITH IMAGE LABEL INSERTED}",

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
    Analyze and enhance the following blog content by inserting up to 10 English image prompts naturally throughout the text based on context. Distribute the images as follows:
    - Intro: 1 image
    - Body: up to 8 images
    - Conclusion: 1 image

    The content structure and placeholders are as follows:
    
    {allcontent}
    
    ### Instructions:
    1. **Content Structure Identification**:
       - Identify and delineate the sections of the content: Intro, Body, Conclusion.
       - If explicit section headers are not present, infer the sections based on content flow.
    
    2. **Content Analysis for Image Placement**:
       - For each identified section (Intro, Body, Conclusion), analyze the content to determine optimal points for image insertion.
       - Consider the theme, tone, and target audience to select appropriate image styles for each section.
       - Note: This analysis is ONLY for determining optimal image prompt placement and style.
       - DO NOT modify or reorganize the original content structure or text.
    
    3. **Image Prompt Insertion**:
       - **Intro**:
         - Insert 1 image prompt.
         - Place the image prompt at a natural breaking point within the Intro section.
         - Label this image as #[1].
       - **Body**:
         - Insert up to 8 image prompts.
         - Distribute the images evenly or as contextually appropriate throughout the Body section.
         - Label these images as #[2] through #[9].
       - **Conclusion**:
         - Insert 1 image prompt.
         - Place the image prompt at a natural breaking point within the Conclusion section.
         - Label this image as #[10].
       - Ensure that no two image prompts are inserted consecutively.
       - Maintain a consistent photography style across all image prompts.
       - Limit images featuring people to approximately 40% of the total.
       - IMPORTANT: Insert prompts at natural breaking points while preserving the original content structure.
    
    4. **Image Prompt Requirements**:
       - Each prompt must follow the structure:
         {Main subject/scene}, {composition details}, {lighting}, {mood/atmosphere}, {photography style}, {additional details}, Korea
       - End each prompt with ", KOREA"
       - Use the numbering format: #[1], #[2], #[3], etc.
    
    5. **Minimal Formatting Guidelines**:
       - You may ONLY add line breaks for readability in intro, body, and conclusion.
       - Add a single empty line between natural paragraph breaks.
       - DO NOT modify, rewrite, or reorganize any content.
       - DO NOT add any other formatting or structural changes.
    
    6. **Output Format**:
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
