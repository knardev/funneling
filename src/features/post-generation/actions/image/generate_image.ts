"use server";
import { makeReplicateRequest } from "../../utils/ai/replictae";
import { ImagePrompts, GeneratedImage } from "../../types";



export async function generateImage(
    imagePrompts: ImagePrompts[]
): Promise<{ images: GeneratedImage[] }> {
    // imagePrompts가 배열이 아닌 경우 배열로 변환
    console.log("start generateImage");
    console.log("Received image prompts:", imagePrompts);
    const promptsArray = Array.isArray(imagePrompts) ? imagePrompts : [imagePrompts];
    
    if (promptsArray.length === 0) {
        return { images: [] };
    }

    const images = await Promise.all(
        promptsArray.map(async (item) => {
            try {
                const imageUrl = await makeReplicateRequest(
                    item.id,
                    item.prompt
                );
                console.log("Replicate imageUrl",imageUrl);
                
                if (imageUrl) {
                    return {
                        id: item.id,
                        imageUrl: imageUrl,
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