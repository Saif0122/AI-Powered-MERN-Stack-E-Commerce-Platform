import { fetchWithKind } from './axiosWrapper';

export const RecommendationsService = {
    async getPersonalizedRecommendations() {
        const result = await fetchWithKind<any>('/recommendations');

        if (!result.ok && result.kind === 'unauthenticated') {
            // Fallback to public recommendations
            return this.getPublicRecommendations();
        }

        return result;
    },

    async getPublicRecommendations(limit = 4) {
        return await fetchWithKind<any>(`/recommendations/public?limit=${limit}`);
    }
};
