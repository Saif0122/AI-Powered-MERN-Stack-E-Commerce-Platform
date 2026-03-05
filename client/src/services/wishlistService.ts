import api from './api';
import type { Wishlist } from '../types';

export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data.data.wishlist as Wishlist;
};

export const addToWishlist = async (productId: string) => {
    const response = await api.post('/wishlist/add', { productId });
    return response.data.data.wishlist as Wishlist;
};

export const removeFromWishlist = async (productId: string) => {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data.data.wishlist as Wishlist;
};

const wishlistService = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};

export default wishlistService;
