import {FunctionTool, OpenAI, OpenAIAgent} from "llamaindex";
import {Animal} from "@/types/animals";
import {WikiResponse} from "@/types/classification";
import {createErrorResponse, createSuccessResponse} from "../../../utils/responses";

// Ensure you have OPENAI_API_KEY in your .env file
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const API_HEADERS = {
    'accept': 'application/json; charset=utf-8',
    'Accept-Language': 'en-us'
};

async function fetchWikipediaInfo({animalName}: { animalName: string }): Promise<string> {    
    try {
        const response = await fetch(
            `${WIKIPEDIA_API_BASE}/${encodeURIComponent(animalName)}?redirect=true`,
            {headers: API_HEADERS}
        );

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data: WikiResponse = await response.json();
        return data.extract || 'No information found';
    } catch (error) {
        console.error('Error fetching animal information:', error);
        throw new Error(`Failed to fetch information about ${animalName}`);
    }
}

const searchInformationToolSchema = {
    type: "object",
    properties: {
        animalName: {
            type: "string",
            description: "The name of the animal",
        }
    },
    required: ["animalName"],
};

const animalSearchTool = new FunctionTool(fetchWikipediaInfo, {
    name: "fetchWikipediaInfo",
    description: "Use this function for searching information of animals on wikipedia",
    parameters: searchInformationToolSchema,
});

const createOpenAIAgent = () => new OpenAIAgent({
    llm: new OpenAI({
        model: "gpt-4o-mini",
        temperature: 0.7,
    }),
    tools: [animalSearchTool],
});

export async function POST(req: Request): Promise<Animal | Response> {
    try {
        const requestBody = await req.json();
        const {animalInformation} = requestBody;

        const agent = createOpenAIAgent()

        const response = await agent.chat({
            message: `Please search me the information of this animal based on this information ${animalInformation} and also does it dangerous or not? Give the response as object format with key information:string and dangerous:boolean
            here is example : 
            {
                information: "",
                dangerous: false
            }`,
        });

        const animal: Animal = JSON.parse(response.message.content.toString());

        return createSuccessResponse(animal);
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error : new Error('Unknown error'));
    }
}


