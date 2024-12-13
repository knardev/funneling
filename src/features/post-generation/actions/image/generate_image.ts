"use server";
import { makeReplicateRequest } from "../../utils/ai/replictae";

interface ImagePrompt {
    id: string;
    prompt: string;
}

interface GeneratedImage {
    id: string;
    imageUrl: string;
}

export async function generateImage(
    imagePrompts: ImagePrompt[] | ImagePrompt
): Promise<{ images: GeneratedImage[] }> {
    // imagePrompts가 배열이 아닌 경우 배열로 변환
    const promptsArray = Array.isArray(imagePrompts) ? imagePrompts : [imagePrompts];
    
    if (promptsArray.length === 0) {
        return { images: [] };
    }

    const images = await Promise.all(
        promptsArray.map(async (item) => {
            try {
                const response = await makeReplicateRequest(
                    item.id,
                    item.prompt
                );
                console.log(response);
                
                if (response.urls.get) {
                    return {
                        id: item.id,
                        imageUrl: response.urls.get,
                    };
                }
                console.warn(`ID: ${item.id} - 결과가 없습니다.`);
                return null;
            } catch (error) {
                console.error(`ID: ${item.id} - 이미지 생성 오류:`, error);
                return null;
            }
        })
    );

    return {
        images: images.filter((image): image is GeneratedImage => image !== null),
    };
}