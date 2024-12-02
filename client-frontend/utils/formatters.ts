export const formatConfidence = (score: number): string => {
    return `${Math.round(score * 100)}%`;
};
