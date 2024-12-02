import type {
    ClassificationRequest,
    ParsedResult
} from '@/types/classification';
import {animals} from "@/types/animals";
import {parseClassificationResponse} from "../../../utils/responses";
import {convertImageToBase64} from "../../../utils/converters";

const CLIP_SERVICE_BASE_URL = 'http://0.0.0.0:51000'

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const image = formData.get('image');

        if (!image || !(image instanceof File)) {
            return new Response(JSON.stringify({message: 'No valid image provided'}), {
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        const dataUri = await convertImageToBase64(image);
        const results: ParsedResult[] = await imageClassification(dataUri);

        return new Response(JSON.stringify({
            message: 'Image processed successfully',
            results: results
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({message: `Error processing request with error ${error}`}), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

async function imageClassification(imageUri: string): Promise<ParsedResult[]> {
    const requestBody: ClassificationRequest = {
        data: [{
            uri: imageUri,
            matches: animals.map(animal => ({
                text: `There is a ${animal.name.toLowerCase()} in the photo`
            }))
        }],
        execEndpoint: "/rank"
    };

    try {
        const response = await fetch(`${CLIP_SERVICE_BASE_URL}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return parseClassificationResponse(data);
    } catch (error) {
        console.error('Error in image classification:', error);
        throw error;
    }
}

