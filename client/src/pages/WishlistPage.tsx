import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Wishlist } from '../types';

const WishlistPage: React.FC = () => {
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await wishlistService.getWishlist();
            setWishlist(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/auth/login', { state: { message: 'Please login to view your wishlist.' } });
            } else {
                fetchWishlist();
            }
        }
    }, [user, authLoading, navigate]);

    const handleRemove = async (productId: string) => {
        try {
            const updated = await wishlistService.removeFromWishlist(productId);
            setWishlist(updated);
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    const handleMoveToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            await handleRemove(productId);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (authLoading || loading) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
            <h2 className="text-3xl font-black mb-8">Accessing your Saved Items...</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-slate-100 rounded-[32px]"></div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-black text-red-500 mb-4">Error</h2>
            <p className="text-slate-500">{error}</p>
        </div>
    );

    if (!wishlist || wishlist.items.length === 0) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Save items you love and they'll appear here. Start exploring our intelligent collection!
            </p>
            <Link to="/shop" className="btn btn-primary px-10 py-4 text-lg font-bold">
                Discover Products
            </Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-slate-900 mb-2">My Wishlist</h1>
                <p className="text-slate-500 font-medium">You have {wishlist.items.length} items saved for later</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.items.map((item) => (
                    <div key={item.product._id} className="card group bg-white border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                        <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center text-4xl">
                            {item.product.images?.length > 0 ? (
                                <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <span>📦</span>
                            )}
                            <button
                                onClick={() => handleRemove(item.product._id)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                                {item.product.title}
                            </h3>
                            <p className="text-2xl font-black text-slate-900 mb-6">${item.product.price}</p>

                            <div className="mt-auto flex gap-3">
                                <button
                                    onClick={() => handleMoveToCart(item.product._id)}
                                    className="btn btn-primary flex-grow py-3 font-bold"
                                >
                                    Move to Cart
                                </button>
                                <Link
                                    to={`/shop/product/${item.product._id}`}
                                    className="bg-slate-50 text-slate-600 px-4 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                                >
                                    👁️
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
