import api from './api';

export interface Category {
    _id: string;
    id?: string;
    name: string;
    slug: string;
    description: string;
}

export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data.data.categories as Category[];
};

const categoryService = {
    getAllCategories,
};

export default categoryService;
