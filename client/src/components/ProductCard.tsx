import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [adding, setAdding] = useState(false);
    const [wishlisting, setWishlisting] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setAdding(true);
            setError(null);
            await addToCart(product._id);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setAdding(false);
        }
    };
    const handleAddToWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            setError('Log in to save items');
            setTimeout(() => setError(null), 3000);
            return;
        }
        try {
            setWishlisting(true);
            await wishlistService.addToWishlist(product._id);
            setIsWishlisted(true);
        } catch (err: any) {
            if (err.response?.data?.message?.includes('already in wishlist')) {
                setIsWishlisted(true);
            } else {
                setError('Failed to save');
                setTimeout(() => setError(null), 3000);
            }
        } finally {
            setWishlisting(false);
        }
    };

    return (
        <div className="card h-full flex flex-col hover:shadow-lg transition-all duration-300 group">
            <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 relative overflow-hidden">
                <span className="text-4xl">📦</span>

                <button
                    onClick={handleAddToWishlist}
                    disabled={wishlisting}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform translate-x-12 group-hover:translate-x-0 ${isWishlisted ? 'bg-red-50 text-red-500 translate-x-0' : 'bg-white text-slate-400 hover:text-red-500'
                        }`}
                >
                    {wishlisting ? (
                        <span className="h-4 w-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                        <span className="text-xl">{isWishlisted ? '❤️' : '♡'}</span>
                    )}
                </button>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.title}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                        ${product.price}
                    </span>
                </div>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">
                    {product.description}
                </p>

                <div className="mt-auto">
                    <div className="flex items-center text-sm text-amber-500 mb-4">
                        <span className="font-bold mr-1">{product.ratingsAverage || 4.5}</span>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.ratingsAverage || 4.5)
                                        ? 'fill-current'
                                        : 'text-slate-300 fill-current'
                                        }`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-slate-400 ml-2">({product.ratingsQuantity || 0})</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Link
                            to={`/shop/product/${product._id}`}
                            className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm py-2 text-center"
                        >
                            View Details
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding || product.stock === 0}
                            className={`btn w-full py-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${error ? 'bg-red-500 text-white' : 'btn-primary'
                                }`}
                        >
                            {adding ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : error ? (
                                'Error!'
                            ) : (
                                <>
                                    <span>🛒</span>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
