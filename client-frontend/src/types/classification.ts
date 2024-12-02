// Response types
export interface ClipScore {
    value: number;
}

export interface Match {
    text: string;
    scores: {
        clip_score: ClipScore;
    };
}

export interface DataItem {
    matches: Match[];
}

export interface ApiResponse {
    data: DataItem[];
}

export interface ParsedResult {
    text: string;
    score: number;
}

export interface ClassificationRequest {
    data: {
        uri: string;
        matches: Array<{
            text: string;
        }>;
    }[];
    execEndpoint: string;
}

export interface ClassificationResponse {
    results: ParsedResult[];
    message: string;
}

export interface AnimalRequestBody {
    animalInformation: string;
}

export interface WikiResponse {
    extract?: string;
    status?: number;
}
