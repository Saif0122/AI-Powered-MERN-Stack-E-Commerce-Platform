import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Important for cookies
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
