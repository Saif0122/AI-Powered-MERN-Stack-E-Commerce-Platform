import { type AxiosError } from 'axios';
import api from './api';
import toast from 'react-hot-toast';

// Add a global interceptor for error handling and loading states
api.interceptors.request.use((config) => {
    window.dispatchEvent(new CustomEvent('api-loading', { detail: { type: 'start' } }));
    return config;
});

api.interceptors.response.use(
    (response) => {
        window.dispatchEvent(new CustomEvent('api-loading', { detail: { type: 'complete' } }));
        return response;
    },
    (error: AxiosError) => {
        window.dispatchEvent(new CustomEvent('api-loading', { detail: { type: 'complete' } }));
        const message = (error.response?.data as any)?.message || 'Something went wrong';

        // Don't show toast for 401 (handled by AuthContext/App logic) or internal skips
        if (error.response?.status !== 401 && error.config?.url !== '/health') {
            toast.error(message, {
                id: 'global-api-error', // Prevent duplicate toasts
            });
        }
        return Promise.reject(error);
    }
);

export type ErrorKind = 'network' | 'server' | 'unauthenticated' | 'client' | 'ignore';

export interface FetchResult<T> {
    ok: boolean;
    data?: T;
    kind?: ErrorKind;
    status?: number;
    error?: any;
}

export const fetchWithKind = async <T>(url: string, opts: { method?: string; data?: any; params?: any; timeout?: number } = {}): Promise<FetchResult<T>> => {
    try {
        const response = await api({
            url,
            method: opts.method || 'GET',
            data: opts.data,
            params: opts.params,
            timeout: opts.timeout,
        });
        return { ok: true, data: response.data };
    } catch (error) {
        const err = error as AxiosError;
        let kind: ErrorKind = 'client';
        const status = err.response?.status;

        if (url.includes('favicon.ico')) {
            kind = 'ignore';
        } else if (!err.response && err.code === 'ECONNABORTED') {
            kind = 'network';
        } else if (!err.response) {
            kind = 'network';
        } else if (status === 401) {
            kind = 'unauthenticated';
        } else if (status && status >= 500) {
            kind = 'server';
        } else if (status === 404) {
            kind = 'client';
        }

        return { ok: false, kind, status, error: err.response?.data };
    }
};

export default api;
