import api from './api';
import type { AxiosRequestConfig } from 'axios';

type SafeResponse<T> = { ok: true; data: T } | { ok: false; error: any };

export const safeApi = {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<SafeResponse<T>> => {
        try {
            const response = await api.get<T>(url, config);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    },
    post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<SafeResponse<T>> => {
        try {
            const response = await api.post<T>(url, data, config);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    },
    patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<SafeResponse<T>> => {
        try {
            const response = await api.patch<T>(url, data, config);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<SafeResponse<T>> => {
        try {
            const response = await api.delete<T>(url, config);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, error };
        }
    }
};
