import axios from 'axios';

// In production (Vercel), VITE_API_URL is not set → falls back to '/api',
// which Vercel rewrites to the Railway backend (no CORS, same-origin request).
// In local dev, set VITE_API_URL=/api in .env and enable the Vite dev proxy in vite.config.ts.
const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Request interceptor for Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            window.dispatchEvent(new CustomEvent('api-network-error'));
            console.error('[API Error]: Network Error, Backend might be down.');
        }

        const message = error.response?.data?.message || 'Something went wrong';

        // Global handling for specific status codes
        if (error.response?.status === 401) {
            // Unauthorized - clear user data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // You could also log to a monitoring service here
        console.error(`[API Error]: ${message}`, {
            status: error.response?.status,
            url: error.config?.url,
        });

        return Promise.reject(error);
    }
);

export default api;
