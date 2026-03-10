import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Unified response handle for errors and success
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (error.code === 'ERR_NETWORK') {
            window.dispatchEvent(new CustomEvent('api-network-error'));
            console.error('[API Error]: Network Error, Backend might be down.');
        }

        const message = error.response?.data?.message || error.message || 'Something went wrong';

        // Global handling for specific status codes (e.g., 401 Unauthorized)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Log error with context
        console.error(`[API Error]: ${message}`, {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });

        return Promise.reject(error);
    }
);

export default api;
