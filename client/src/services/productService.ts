import api from './api';
import type { Product } from '../types';

export const getProductsByCategory = async (categoryId: string) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data.data.products as Product[];
};

export const getAllProducts = async () => {
    const response = await api.get('/products');
    return response.data.data.products as Product[];
};

export const getProductById = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product as Product;
};

const productService = {
    getProductsByCategory,
    getAllProducts,
    getProductById,
};

export default productService;
