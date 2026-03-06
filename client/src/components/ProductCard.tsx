import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [adding, setAdding] = useState(false);
    const [wishlisting, setWishlisting] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setAdding(true);
            await addToCart(product._id);
            toast.success(`${product.title} added to cart!`, {
                style: {
                    borderRadius: '1rem',
                    background: '#0f172a',
                    color: '#fff',
                    fontWeight: 'bold',
                },
            });
        } catch (err: any) {
            toast.error(err.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleAddToWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to save items');
            return;
        }
        try {
            setWishlisting(true);
            await wishlistService.addToWishlist(product._id);
            setIsWishlisted(true);
            toast.success('Added to wishlist', {
                icon: '❤️',
            });
        } catch (err: any) {
            if (err.response?.data?.message?.includes('already in wishlist')) {
                setIsWishlisted(true);
                toast('Already in wishlist!', { icon: '✨' });
            } else {
                toast.error('Failed to save to wishlist');
            }
        } finally {
            setWishlisting(false);
        }
    };

    const hasSale = product.salePrice && product.salePrice < product.price;

    return (
        <Link
            to={`/shop/product/${product._id}`}
            className="group bg-white border border-slate-100 p-4 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative"
        >
            {/* Image Container */}
            <div className="aspect-square bg-slate-50 rounded-[1.5rem] mb-5 overflow-hidden border border-slate-100/50 flex items-center justify-center relative">
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <span className="text-5xl opacity-20 filter grayscale">📦</span>
                )}

                {/* Badge */}
                {hasSale && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Sale
                    </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={handleAddToWishlist}
                        disabled={wishlisting}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-slate-900 hover:bg-brand-600 hover:text-white'
                            }`}
                    >
                        {wishlisting ? (
                            <span className="h-5 w-5 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
                        ) : (
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        )}
                    </button>
                    <div className="w-11 h-11 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-brand-600 hover:text-white">
                        <Eye size={20} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-black text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1 text-lg mb-1">{product.title}</h3>
                </div>

                <div className="flex items-center mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-700">{product.ratingsAverage || 0}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-widest">({product.ratingsQuantity || 0} REVIEWS)</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        {hasSale ? (
                            <div className="flex items-center gap-2">
                                <span className="text-brand-600 font-black text-xl">${product.salePrice}</span>
                                <span className="text-slate-300 line-through text-xs font-bold">${product.price}</span>
                            </div>
                        ) : (
                            <p className="text-slate-900 font-black text-xl">${product.price}</p>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={adding || product.stock === 0}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${adding ? 'bg-slate-100' : 'bg-slate-900 text-white hover:bg-brand-600 active:scale-90 hover:shadow-brand-200'
                            } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {adding ? (
                            <span className="h-5 w-5 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" />
                        ) : (
                            <ShoppingCart size={20} strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
