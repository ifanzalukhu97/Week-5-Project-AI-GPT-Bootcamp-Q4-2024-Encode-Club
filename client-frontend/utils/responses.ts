import {Animal} from "@/types/animals";
import type {ApiResponse, ParsedResult} from "@/types/classification";

export const createSuccessResponse = (data: Animal): Response => {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

export const createErrorResponse = (error: Error): Response => {
    return new Response(JSON.stringify({
        error: `Error processing request: ${error.message}`
    }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
};

export function parseClassificationResponse(response: ApiResponse): ParsedResult[] {
    return response.data[0].matches.map(match => ({
        text: match.text,
        score: match.scores.clip_score.value
    }));
}
