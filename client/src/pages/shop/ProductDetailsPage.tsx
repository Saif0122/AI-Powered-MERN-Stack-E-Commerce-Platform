import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product } from '../../types';
import { safeApi } from '../../services/safeApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import wishlistService from '../../services/wishlistService';
import ProductCard from '../../components/ProductCard';

const ProductDetailsPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlisting, setWishlisting] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [fetchingRelated, setFetchingRelated] = useState(false);

    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await safeApi.get<any>(`/products/${productId}`);
                if (response.ok) {
                    const p = response.data.data.product;
                    setProduct(p);
                    // Fetch related products based on title/description
                    fetchRelated(p.title);
                } else {
                    if (response.error?.response?.status === 400 || response.error?.response?.status === 404) {
                        setError('Product not found');
                    } else {
                        setError(response.error?.response?.data?.message || 'Failed to connect to the server');
                    }
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        const fetchRelated = async (query: string) => {
            try {
                setFetchingRelated(true);
                const response = await safeApi.get<any>(`/recommendations?query=${encodeURIComponent(query)}&limit=4`);
                if (response.ok) {
                    setRelatedProducts(response.data.data.products);
                } else {
                    console.error('Failed to fetch related products', response.error);
                }
            } catch (err) {
                console.error('System error fetching related products', err);
            } finally {
                setFetchingRelated(false);
            }
        };

        if (productId) {
            fetchProduct();
            // Reset image when product changes
            setActiveImage(0);
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            setAddingToCart(true);
            await addToCart(product._id, 1);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            alert('Please login to save items to your wishlist');
            return;
        }
        if (!product) return;
        try {
            setWishlisting(true);
            await wishlistService.addToWishlist(product._id);
            setIsWishlisted(true);
        } catch (err: any) {
            if (err.response?.data?.message?.includes('already in wishlist')) {
                setIsWishlisted(true);
            } else {
                alert('Failed to save to wishlist');
            }
        } finally {
            setWishlisting(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-3xl"></div>
                <div className="space-y-6">
                    <div className="h-10 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-32 bg-slate-200 rounded"></div>
                    <div className="h-12 bg-slate-200 rounded w-full"></div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Error</h2>
            <p className="text-slate-500 mb-8">{error || 'Product not found'}</p>
            <Link to="/shop" className="btn btn-primary px-8 py-3">Back to Shop</Link>
        </div>
    );

    const hasSale = product.salePrice && product.salePrice < product.price;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                {/* Image Gallery */}
                <div className="space-y-6">
                    <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 flex items-center justify-center text-8xl">
                        {product.images?.length > 0 ? (
                            <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <span>📦</span>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-600 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            {hasSale && (
                                <span className="bg-red-100 text-red-600 text-sm font-black px-3 py-1 rounded-full uppercase">
                                    {product.discountPercentage}% OFF
                                </span>
                            )}
                            <span className={`text-sm font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4">{product.title}</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-500">
                                <span className="text-lg font-black">{product.ratingsAverage}</span>
                                <span className="text-sm">★★★★★</span>
                            </div>
                            <span className="text-slate-400 font-medium">({product.reviewCount || 0} reviews)</span>
                        </div>
                    </div>

                    <div className="py-8 border-y border-slate-100">
                        <div className="flex items-baseline gap-4 mb-2">
                            {hasSale ? (
                                <>
                                    <span className="text-5xl font-black text-brand-600">${product.salePrice}</span>
                                    <span className="text-2xl text-slate-300 line-through font-bold">${product.price}</span>
                                </>
                            ) : (
                                <span className="text-5xl font-black text-slate-900">${product.price}</span>
                            )}
                        </div>
                        <p className="text-slate-500 font-medium">Inclusive of all taxes</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Description</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || product.stock === 0}
                            className="btn btn-primary flex-grow py-5 text-xl font-black shadow-2xl shadow-brand-200"
                        >
                            {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            disabled={wishlisting}
                            className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all text-2xl shadow-xl ${isWishlisted
                                ? 'bg-red-50 border-red-100 text-red-500'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            {wishlisting ? (
                                <span className="h-6 w-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                isWishlisted ? '❤️' : '♡'
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <p className="font-bold text-sm">Fast Delivery</p>
                                <p className="text-xs text-slate-400">Within 24 hours</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <span className="text-2xl">🛡️</span>
                            <div>
                                <p className="font-bold text-sm">Security</p>
                                <p className="text-xs text-slate-400">AI Protected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Recommendations / Related Products */}
            <div className="mt-32">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">Related Products</h2>
                        <p className="text-slate-500 font-medium">Curated by our smart recommendation engine</p>
                    </div>
                    <Link to="/shop" className="text-brand-600 font-black hover:underline">View All Shop →</Link>
                </div>

                {fetchingRelated ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
                        <p className="text-slate-400 font-medium animate-pulse">Searching for similar matches...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.length > 0 ? (
                            relatedProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
                                <p className="text-slate-400 font-medium">No related products found yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="mt-32 max-w-4xl">
                <div className="flex justify-between items-baseline mb-12">
                    <h2 className="text-4xl font-black text-slate-900">Customer Reviews</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-brand-600">{product.ratingsAverage}</span>
                        <div className="text-amber-500 text-lg">★★★★★</div>
                        <span className="text-slate-400 font-medium">based on {product.reviewCount || 0} reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Write Review */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="card bg-slate-50 p-8 border border-slate-100">
                            <h3 className="text-xl font-bold mb-4">Share your thoughts</h3>
                            <p className="text-slate-500 text-sm mb-6">How was your experience with this product?</p>
                            <button className="btn btn-primary w-full py-3 font-bold shadow-lg shadow-brand-200">
                                Write a Review
                            </button>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Placeholder for real reviews */}
                        <div className="border-b border-slate-100 pb-8">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">Amazing quality!</p>
                                    <div className="text-amber-500 text-sm">★★★★★</div>
                                </div>
                                <span className="text-slate-400 text-sm font-medium">2 days ago</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                This product exceeded my expectations. The AI-driven search actually led me to exactly what I was looking for. Highly recommend!
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">JD</span>
                                <span className="text-sm font-bold text-slate-700">John Doe</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">Verified Purchase</span>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-8">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">Great value for money</p>
                                    <div className="text-amber-500 text-sm">★★★★☆</div>
                                </div>
                                <span className="text-slate-400 text-sm font-medium">1 week ago</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Solid build and works as advertised. Shipping was predictably fast.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">AS</span>
                                <span className="text-sm font-bold text-slate-700">Alice Smith</span>
                            </div>
                        </div>

                        <button className="text-brand-600 font-extrabold hover:underline">Show more reviews ({product.reviewCount || 2})</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
