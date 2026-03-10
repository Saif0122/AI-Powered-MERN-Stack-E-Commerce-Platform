import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Wishlist } from '../types';
import EmptyState from '../components/common/EmptyState';
import { Heart, ShoppingCart, Trash2, Eye, Sparkles, Zap, ChevronRight, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.success('Asset removed from curation', {
                icon: '✨',
                style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
            });
        } catch (err) {
            toast.error('System error: Could not remove asset');
        }
    };

    const handleMoveToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            await handleRemove(productId);
            toast.success('Asset prioritized for checkout', {
                style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
            });
        } catch (err: any) {
            toast.error(err.message || 'Operation failed');
        }
    };

    if (authLoading || loading) return (
        <div className="max-w-7xl mx-auto px-8 py-32">
            <div className="flex items-center gap-4 mb-12 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl"></div>
                <div className="space-y-2">
                    <div className="h-8 bg-slate-100 rounded w-48"></div>
                    <div className="h-4 bg-slate-100 rounded w-32"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[450px] bg-slate-50 rounded-[3rem] animate-pulse border border-slate-100"></div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-8 py-32 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl">⚠️</div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">System Error Detected</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium italic">"{error}"</p>
            <button onClick={fetchWishlist} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl">Re-initialize Connection</button>
        </div>
    );

    if (!wishlist || wishlist.items.length === 0) return (
        <EmptyState
            icon={Bookmark}
            title="Curation List Empty"
            description="Your specialized selection of high-value assets is currently void. Flag items during your catalog exploration to populate this list."
            actionText="Enter Market"
            actionLink="/shop"
        />
    );

    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="max-w-7xl mx-auto px-8 pt-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-[10px] mb-4">
                            <Sparkles size={14} fill="currentColor" /> Premium Curation
                        </div>
                        <h1 className="text-7xl font-black text-slate-950 tracking-tighter leading-none">Intelligence <br />Wishlist</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Saved Assets</p>
                            <p className="font-black text-slate-950 text-2xl">{wishlist.items.length} Units</p>
                        </div>
                        <Link to="/shop" className="bg-slate-50 hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all border border-slate-100">
                            Discovery Mode <Zap size={18} fill="currentColor" className="text-brand-600" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {wishlist.items.map((item) => (
                        <div key={item.product._id} className="group relative bg-white border border-slate-100 rounded-[3.5rem] p-4 hover:shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] transition-all duration-700 flex flex-col h-full active:scale-[0.98]">
                            {/* Card Header Illustration Area */}
                            <div className="aspect-[4/5] bg-slate-50 rounded-[3rem] relative overflow-hidden flex items-center justify-center text-8xl mb-6">
                                {item.product.images?.length > 0 ? (
                                    <img
                                        src={item.product?.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                                        alt={item.product?.title || 'Product'}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                ) : (
                                    <span className="opacity-20 filter grayscale">📦</span>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center flex-col gap-4">
                                    <Link
                                        to={`/shop/product/${item.product._id}`}
                                        className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-brand-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 shadow-2xl"
                                    >
                                        <Eye size={24} />
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(item.product._id)}
                                        className="w-14 h-14 bg-white/20 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center backdrop-blur-md transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-150 shadow-2xl"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>

                                {item.product.salePrice && item.product.salePrice < item.product.price && (
                                    <div className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-xl">
                                        Optimization active
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="px-6 pb-6 flex flex-col flex-grow">
                                <Link to={`/shop/product/${item.product._id}`} className="block mb-2 overflow-hidden">
                                    <h3 className="text-2xl font-black text-slate-950 leading-tight tracking-tight group-hover:text-brand-600 transition-colors line-clamp-1">
                                        {item.product.title}
                                    </h3>
                                </Link>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-950 tracking-tighter">${item.product.salePrice || item.product.price}</span>
                                        {item.product.salePrice && (
                                            <span className="text-sm text-slate-300 line-through font-bold">${item.product.price}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-amber-400">
                                        <Heart size={16} fill="currentColor" />
                                        <span className="text-xs font-black text-slate-900">SAVED</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleMoveToCart(item.product._id)}
                                    className="mt-auto w-full bg-slate-950 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-brand-600 hover:shadow-2xl shadow-slate-900/10 group/btn"
                                >
                                    <ShoppingCart size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                    Prioritize Checkout
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Quick Access to Shop Card */}
                    <Link to="/shop" className="group relative bg-slate-50 border border-slate-100 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-center hover:bg-brand-50 hover:border-brand-200 transition-all duration-700">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 text-brand-600 shadow-xl group-hover:scale-110 transition-transform">
                            <Zap size={40} fill="currentColor" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-950 mb-4 tracking-tighter">Discover More Assets</h3>
                        <p className="text-slate-500 font-medium italic mb-10">Expand your curation with our latest high-level arrivals.</p>
                        <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                            Open Catalog <ChevronRight size={16} />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
