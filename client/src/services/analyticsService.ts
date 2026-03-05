import api from './api';

const analyticsService = {
    /**
     * Get admin global stats
     */
    getAdminStats: async () => {
        const response = await api.get('/analytics/admin');
        return response.data.data;
    },

    /**
     * Get vendor specific stats
     */
    getVendorStats: async () => {
        const response = await api.get('/analytics/vendor');
        return response.data.data;
    }
};

export default analyticsService;
