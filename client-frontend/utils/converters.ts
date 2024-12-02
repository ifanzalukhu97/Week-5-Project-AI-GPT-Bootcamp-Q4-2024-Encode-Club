export async function convertImageToBase64(file: File): Promise<string> {
    try {
        const contentType = file.type;
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64String}`;
    } catch (error) {
        throw new Error(`Failed to convert image to base64 with error ${error}`);
    }
}
