import api from './api';
import type { Product } from '../types';

export interface InventoryUpdate {
    productId: string;
    stock?: number;
    price?: number;
    salePrice?: number;
    lowStockThreshold?: number;
    vendorNotes?: string;
}

export const getVendorProducts = async () => {
    const response = await api.get('/vendor/products');
    return response.data.data.products as Product[];
};

export const updateInventory = async (id: string, data: Partial<InventoryUpdate>) => {
    const response = await api.put(`/vendor/products/${id}`, data);
    return response.data.data.product as Product;
};

export const bulkUpdateStock = async (updates: { productId: string; stock: number }[]) => {
    const response = await api.post('/vendor/products/bulk-stock', { updates });
    return response.data;
};

export const createProduct = async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data.data.product as Product;
};

const vendorService = {
    getVendorProducts,
    updateInventory,
    bulkUpdateStock,
    createProduct,
};

export default vendorService;
