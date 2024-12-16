import { Analysis } from "../../types";

export const imagepromptPrompt = {
    system: `
    You are an expert in creating image prompts for blog content. Your role is to analyze and enhance blog sections by inserting relevant and high-quality English image prompts. Every sentence you generate should be clear, concise, and specific to ensure the best possible image generation results.`,
    template: `
    Analyze and enhance the following blog content by inserting up to 10 English image prompts naturally throughout the text based on context. The content structure and placeholders are as follows:
    
    content: {allcontent}
    
    ### Instructions:
    1. **Content Analysis**:
       - Understand the content's main theme, purpose, and target audience using the provided title, table of contents, introduction, body, and conclusion.
       - Determine the overall tone (formal/casual, serious/light-hearted, etc.).
       - Decide on a suitable photography style based on the tone and topic:
         * Professional editorial photography for formal/informative content
         * Lifestyle photography for casual/personal content
       - Identify key points in the introduction, body, and conclusion where a visual would enhance the content. The exact insertion points should be flexible and contextually relevant.
    
    2. **Image Prompt Insertion**:
       - Insert up to 10 image prompts within the intro, body, and conclusion sections.
       - Each image prompt should be inserted as a placeholder in the format #[id], where id is a unique integer starting from 1.
       - Ensure that no two image prompts are inserted consecutively without at least one paragraph of text between them.
       - Maintain a consistent photography style across all image prompts.
       - Limit images featuring people to approximately 40% of the total, ensuring they appear naturally within the context.
    
    3. **Image Prompt Requirements**:
       - Each prompt must follow the structure:
         {Main subject/scene}, {composition details}, {lighting}, {mood/atmosphere}, {photography style}, {additional details}, Korea
       - End each prompt with ", Korea"
       - Use the numbering format: #[1], #[2], #[3], etc.

    4. **Readability Formatting**:
       - After each paragraph, add three empty lines
       - Within each paragraph, after every 3-4 sentences add a single empty line
       - Limit each paragraph to a maximum of 4 groups of sentences
       - Apply this formatting consistently throughout the entire content
    
    5. **Output Format**:
       - **YOU MUST RETURN A JSON OBJECT WITH EXACTLY TWO KEYS:**
         1. "updatedContent": MUST BE A SINGLE STRING containing the complete original content with:
            * Image prompt placeholders (#[1], #[2], etc.) inserted
            * Proper formatting applied (line breaks between paragraphs and sentence groups)
            * No structural changes or reorganization of the content
            * No object/key-value structure - just a continuous text string
         2. "image_prompts": An object mapping each id to its corresponding image prompt
    
    ### Example Output:
    {
      "updatedContent": "{enhanced allcontent with image prompts inserted}",

      "image_prompts": {
          "1": "A serene sunrise over a mountain range, wide-angle composition, soft natural lighting, peaceful and calm atmosphere, professional editorial photography, high-resolution details, Korea",
          "2": "A group of professionals in a modern office, candid composition, bright indoor lighting, collaborative and dynamic mood, professional editorial photography, diverse team members, Korea",
          "3": "A cozy home workspace setup, close-up composition, warm lighting, inviting and productive atmosphere, lifestyle photography, minimalist design elements, Korea",
          "4": "A bright modern office space with large windows, wide-angle composition, natural daylight streaming in, energetic and fresh atmosphere, professional editorial photography, contemporary design elements, Korea",
          "5": "A tranquil garden in full bloom, medium composition, natural lighting, relaxing and rejuvenating atmosphere, lifestyle photography, vibrant flower colors, Korea"
      }
    }
    
    ### Critical Requirements:
    - **updatedContent MUST BE A SINGLE STRING, not an object with sections**
    - **DO NOT split content into separate keys or restructure it**
    - **Maintain all original content exactly as provided**
    - **Insert ONLY image placeholders and formatting changes**
    - **Ensure proper line breaks for readability**
    - **Return ONLY the JSON object with no additional text**
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
