import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => void;
    fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchCart = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('/cart');
            setCart(response.data.data.cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        try {
            setLoading(true);
            const response = await api.post('/cart/add', { productId, quantity });
            setCart(response.data.data.cart);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            setLoading(true);
            const response = await api.put('/cart/update', { productId, quantity });
            setCart(response.data.data.cart);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update quantity');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            setLoading(true);
            const response = await api.delete(`/cart/remove/${productId}`);
            setCart(response.data.data.cart);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
        } finally {
            setLoading(false);
        }
    };

    const clearCart = () => setCart(null);

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
