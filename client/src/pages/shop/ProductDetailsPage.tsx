import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product } from '../../types';
import { safeApi } from '../../services/safeApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import wishlistService from '../../services/wishlistService';
import ProductCard from '../../components/ProductCard';
import SEO from '../../components/common/SEO';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RefreshCcw, Share2, Info, ChevronRight, MessageSquare, Award, UserCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

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
                }
            } catch (err) {
                console.error('System error fetching related products', err);
            } finally {
                setFetchingRelated(false);
            }
        };

        if (productId) {
            fetchProduct();
            setActiveImage(0);
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            setAddingToCart(true);
            await addToCart(product._id, 1);
            toast.success('Successfully added to cart!', {
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
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            toast.error('Please login to save items');
            return;
        }
        if (!product) return;
        try {
            setWishlisting(true);
            await wishlistService.addToWishlist(product._id);
            setIsWishlisted(true);
            toast.success('Added to your wishlist! ❤️');
        } catch (err: any) {
            if (err.response?.data?.message?.includes('already in wishlist')) {
                setIsWishlisted(true);
                toast('Already in your wishlist', { icon: '✨' });
            } else {
                toast.error('Failed to save to wishlist');
            }
        } finally {
            setWishlisting(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-8 py-24 text-center">
            <div className="mb-12">
                <RefreshCcw size={48} className="animate-spin text-brand-600 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Synchronizing Product Data...</h2>
                <p className="text-slate-500 font-medium italic">Establishing secure connection to marketplace nodes.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-pulse text-left">
                <div className="aspect-square bg-slate-100 rounded-[3rem]"></div>
                <div className="space-y-8">
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-12 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-32 bg-slate-100 rounded-[2rem]"></div>
                    <div className="h-16 bg-slate-100 rounded-[1.5rem] w-full"></div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="max-w-7xl mx-auto px-8 py-32 text-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">⚠️</div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Product Not Found</h2>
            <p className="text-slate-500 mb-12 text-lg max-w-md mx-auto">{error || 'The product you are looking for might have been moved or deleted.'}</p>
            <Link to="/shop" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl">Explore Other Products</Link>
        </div>
    );

    const hasSale = product?.salePrice && product?.price && product.salePrice < product.price;

    return (
        <div className="bg-white">
            <SEO title={product?.title || 'Product Details'} description={product?.description?.substring(0, 160) || ''} />

            <div className="max-w-7xl mx-auto px-8 py-16">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-brand-600 transition-colors">Shop</Link>
                    <ChevronRight size={12} />
                    <span className="text-slate-900">{product?.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Image Gallery */}
                    <div className="space-y-8 sticky top-24">
                        <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 flex items-center justify-center text-8xl relative group">
                            {product?.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[activeImage]}
                                    alt={product?.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <span className="opacity-20 filter grayscale">📦</span>
                            )}

                            <button className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 hover:bg-brand-600 hover:text-white transition-all shadow-xl">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {product?.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`min-w-[100px] h-[100px] rounded-[1.5rem] overflow-hidden border-2 transition-all p-1 ${activeImage === idx ? 'border-brand-600 bg-brand-50 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-[1.2rem]" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {hasSale && (
                                    <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-200">
                                        <Zap size={12} fill="currentColor" />
                                        Flash Save {product.discountPercentage}% OFF
                                    </div>
                                )}
                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${product.stock > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                    <ShieldCheck size={12} />
                                    {product.stock > 5 ? 'Guaranteed In Stock' : product.stock > 0 ? `Limited Stock: ${product.stock} Left` : 'Sold Out'}
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">{product?.title}</h1>

                            <div className="flex items-center gap-6 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.floor(product?.ratingsAverage || 5) ? 'currentColor' : 'none'} className={i < Math.floor(product?.ratingsAverage || 5) ? '' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{product?.ratingsAverage || 4.9}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MessageSquare size={16} />
                                    <span className="text-sm font-bold uppercase tracking-widest">{product?.ratingsQuantity || 0} Professional Reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 blur-3xl rounded-full"></div>
                            <div className="flex items-baseline gap-4 mb-2 relative z-10">
                                {hasSale ? (
                                    <>
                                        <span className="text-6xl font-black text-brand-600 tracking-tight">${product.salePrice}</span>
                                        <span className="text-2xl text-slate-300 line-through font-bold">${product.price}</span>
                                    </>
                                ) : (
                                    <span className="text-6xl font-black text-slate-900 tracking-tight">${product.price}</span>
                                )}
                            </div>
                            <p className="text-slate-500 font-bold text-sm tracking-wide flex items-center gap-2">
                                <Info size={14} className="text-brand-500" />
                                Secured price protection active. No hidden fees.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs">
                                <Award size={16} className="text-brand-600" /> Product Intelligence
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg font-medium text-balance">
                                {product?.description}
                            </p>
                        </div>

                        {/* Seller Info */}
                        {product.vendor && typeof product.vendor !== 'string' && (
                            <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                                        {product?.vendor && typeof product.vendor !== 'string' && product.vendor.name ? product.vendor.name.charAt(0) : 'S'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-black text-slate-900 leading-none">{product?.vendor && typeof product.vendor !== 'string' ? product.vendor.name || 'Premium Seller' : 'Premium Seller'}</h4>
                                            <UserCheck size={14} className="text-blue-500" />
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Logistics Partner</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-brand-600 uppercase tracking-widest">Store Rating</div>
                                    <div className="flex items-center gap-1 text-slate-900 font-black mt-1">
                                        <Star size={14} fill="currentColor" className="text-amber-400" />
                                        4.8/5.0
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || product.stock === 0}
                                className="flex-grow bg-slate-900 text-white rounded-[1.5rem] py-5 text-xl font-black transition-all hover:bg-brand-600 hover:scale-[1.02] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {addingToCart ? (
                                    <RefreshCcw size={24} className="animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart size={24} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                                        Initialize Order
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleAddToWishlist}
                                disabled={wishlisting}
                                className={`w-20 h-20 rounded-[1.5rem] border flex items-center justify-center transition-all shadow-xl ${isWishlisted
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : 'bg-white border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100'
                                    }`}
                            >
                                {wishlisting ? (
                                    <RefreshCcw size={24} className="animate-spin" />
                                ) : (
                                    <Heart size={28} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>

                        {/* Value Props */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-50">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">Express Fulfillment</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Logistics</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">System Integrity</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">AI Protected Pay</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <RefreshCcw size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">Simple Restitution</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">30-Day Protocol</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <div className="mt-40">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-xs mb-4">
                                <Zap size={16} fill="currentColor" /> Discovery Engine
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter text-slate-950">Intelligent Pairings</h2>
                            <p className="text-slate-500 mt-4 text-lg font-medium italic">Analyzed and computed by our high-level semantic matchmaker.</p>
                        </div>
                        <Link to="/shop" className="text-slate-900 font-black flex items-center gap-2 hover:text-brand-600 transition-colors text-lg">
                            Browse Collection <ChevronRight size={20} />
                        </Link>
                    </div>

                    {fetchingRelated ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-slate-50 rounded-[2.5rem] animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {relatedProducts.length > 0 ? (
                                relatedProducts.map(p => (
                                    <ProductCard key={p._id} product={p} />
                                ))
                            ) : (
                                <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center">
                                    <p className="text-slate-400 font-black italic">No immediate semantic pairings detected in current catalog.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="mt-40 border-t border-slate-100 pt-40">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-4 sticky top-24 h-fit">
                            <h2 className="text-5xl font-black tracking-tighter text-slate-950 mb-8 leading-none">Market <br />Validation</h2>

                            <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white space-y-8 shadow-2xl shadow-slate-900/20">
                                <div className="space-y-2">
                                    <div className="text-6xl font-black text-brand-400 leading-none">{product.ratingsAverage || 5.0}</div>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Consensus Score</p>
                                </div>

                                <div className="space-y-4">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="text-xs font-black text-slate-500 w-4">{star}★</span>
                                            <div className="flex-grow h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-500"
                                                    style={{ width: star === 5 ? '85%' : star === 4 ? '15%' : '0%' }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-500 w-8">{star === 5 ? '85%' : star === 4 ? '15%' : '0%'}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-[1.5rem] font-black transition-all shadow-xl shadow-brand-900/20 active:scale-95">
                                    Authenticate Review
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-12">
                            <div className="flex items-center justify-between items-baseline mb-4">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Certified Statements</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{product.ratingsQuantity || 0} Entries Identified</p>
                            </div>

                            <div className="space-y-10">
                                {/* Sample Reviews with Premium Styling */}
                                {[
                                    { name: "Julian Thorne", date: "2 Hours Ago", initial: "JT", text: "Impeccable build quality. The delivery timeline was accurately projected by the system.", score: 5 },
                                    { name: "Aria Vance", date: "Yesterday", initial: "AV", text: "Product matches the digital preview perfectly. The packaging was highly secured.", score: 5 },
                                    { name: "Cassian Blake", date: "3 Days Ago", initial: "CB", text: "Slight delay in logistics, but the transparency from the seller was excellent. Top tier quality.", score: 4 }
                                ].map((rev, i) => (
                                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-black group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                                    {rev.initial}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 leading-none mb-1">{rev.name}</h4>
                                                    <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest italic">Verified Procurement</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-amber-400 mb-1">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.score ? 'currentColor' : 'none'} className={i < rev.score ? '' : 'text-slate-100'} />)}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{rev.date}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-lg font-medium leading-relaxed italic">"{rev.text}"</p>
                                    </div>
                                ))}

                                <button className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                                    Load Extended Records <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
