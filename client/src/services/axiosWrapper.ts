import { type AxiosError } from 'axios';
import api from './api';

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
