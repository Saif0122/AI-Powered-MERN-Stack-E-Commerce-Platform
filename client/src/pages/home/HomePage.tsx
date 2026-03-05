/*
MercatoX AI E-Commerce Platform
Copyright © 2026
All Rights Reserved.

Unauthorized copying of this file or system is strictly prohibited.
*/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationsService } from '../../services/RecommendationsService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import type { Category } from '../../services/categoryService';
import type { Product } from '../../types';

// Featured Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
    return (
        <Link
            to={`/shop/product/${product._id}`}
            className="group bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-100/50 flex items-center justify-center relative">
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <span className="text-5xl opacity-40">📦</span>
                )}
                {product.salePrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Sale
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">{product.title}</h3>
                <div className="flex items-center mb-2">
                    <div className="flex text-amber-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < Math.round(product.ratingsAverage || 0) ? '★' : '☆'}</span>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400 ml-1">({product.ratingsQuantity || 0})</span>
                </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
                <div>
                    {product.salePrice ? (
                        <div className="flex items-center gap-2">
                            <span className="text-brand-600 font-black text-lg">${product.salePrice}</span>
                            <span className="text-slate-400 line-through text-sm font-medium">${product.price}</span>
                        </div>
                    ) : (
                        <p className="text-brand-600 font-black text-lg">${product.price}</p>
                    )}
                </div>
                <button className="bg-slate-900 text-white p-2 rounded-xl hover:bg-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </Link>
    );
};

const RecommendedForYou = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [title, setTitle] = useState('Recommended for You');

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const result = await RecommendationsService.getPersonalizedRecommendations();
                if (result.ok && result.data?.data?.recommendations?.length > 0) {
                    setProducts(result.data.data.recommendations);
                    setTitle('Recommended for You');
                } else if (result.data?.data?.products?.length > 0) {
                    setProducts(result.data.data.products);
                    setTitle('Popular for Guests');
                }
            } catch (err) { }
        };
        fetchRecs();
    }, []);

    if (!products || products.length === 0) return null;

    return (
        <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">{title}</h2>
                <Link to="/shop" className="text-brand-600 font-bold hover:underline">View All</Link>
            </div>
            {products.slice(0, 4).map((p: any) => (
                <ProductCard product={p} key={p._id} />
            ))}
        </section>
    );
};

const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [dealProducts, setDealProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allCats, allProds] = await Promise.all([
                    categoryService.getAllCategories(),
                    productService.getAllProducts()
                ]);

                setCategories(allCats);

                // For demonstration, we'll split products based on attributes or slice them
                setFeaturedProducts(allProds.slice(0, 8));

                // Trending: Highly rated (average > 4)
                setTrendingProducts(allProds.filter(p => (p.ratingsAverage || 0) >= 4).slice(0, 4));

                // Best Deals: Percentage discount present
                setDealProducts(allProds.filter(p => p.salePrice || (p.discountPercentage && p.discountPercentage > 0)).slice(0, 4));

            } catch (err) {
                console.error("Failed to fetch home data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px] bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium tracking-tight">Loading your shopping experience...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">
            {/* 1. Hero Section */}
            <section className="relative h-[600px] flex items-center overflow-hidden bg-slate-900 mb-20">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-1"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-2xl">
                        <span className="inline-block bg-brand-600 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
                            Smart Shopping Hub
                        </span>
                        <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
                            Future of <br />
                            <span className="text-brand-500">Modern Commerce</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-lg">
                            Experience the next generation of online shopping powered by intelligent semantic search and personalized discovery.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/shop" className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-xl shadow-brand-600/20">
                                Shop Now
                            </Link>
                            <Link to="/recommendations" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-10 py-4 rounded-2xl font-black text-lg transition-all border border-white/20">
                                AI Assistant
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6">
                {/* 2. Featured Products */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">Featured Products</h2>
                            <p className="text-slate-500 mt-1">Handpicked quality products for our customers.</p>
                        </div>
                        <Link to="/shop" className="text-brand-600 font-bold hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>

                {/* 3. Categories Section */}
                <section className="mb-20">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Browse by Category</h2>
                        <p className="text-slate-500 mt-1">Find exactly what you're looking for.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat._id}
                                to={`/shop/category/${cat._id}`}
                                className="group bg-white border border-slate-100 p-6 rounded-3xl text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-50 transition-colors">
                                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                                        {cat.name === 'Electronics' ? '📱' : cat.name === 'Clothing' ? '👕' : '📦'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 4. Trending Products */}
                <section className="mb-20">
                    <div className="bg-slate-900 rounded-[3rem] p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-[100px] rounded-full"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-white">Trending Now</h2>
                                    <p className="text-slate-400 mt-1">What everyone is talking about this week.</p>
                                </div>
                                <Link to="/shop" className="text-brand-400 font-bold hover:underline">View All</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {trendingProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. Personalized Discovery (From existing code) */}
                <RecommendedForYou />

                {/* 5. Best Deals / Sale Section */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">Unbeatable Deals</h2>
                            <p className="text-slate-500 mt-1">Premium products at discounted prices.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {dealProducts.length > 0 ? (
                            dealProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="text-slate-400 italic">Checking for active deals...</p>
                        )}
                    </div>
                </section>

                {/* 6. Why Choose Us Section */}
                <section className="bg-white border border-slate-100 rounded-[3rem] p-12 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Delivery</h3>
                            <p className="text-slate-500">Usually arrives within 2-3 business days at your doorstep.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Payment</h3>
                            <p className="text-slate-500">Multiple secure payment options backed by top providers.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Quality Products</h3>
                            <p className="text-slate-500">We only partner with certified vendors for high quality.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">24/7 Support</h3>
                            <p className="text-slate-500">Dedicated support team to help you at any step.</p>
                        </div>
                    </div>
                </section>

                {/* 7. Testimonials Section */}
                <section className="mb-20">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4">What Our Customers Say</h2>
                        <p className="text-slate-500">Join thousands of happy shoppers who trust MercatoX for their daily needs.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Johnson", role: "Frequent Buyer", text: "The AI search is genuinely helpful. Found exactly the laptop I needed without scrolling for hours.", avatar: "👩‍💼" },
                            { name: "Michael Chen", role: "Tech Enthusiast", text: "Delivery was incredibly fast. The product quality exceeded my expectations for the price.", avatar: "👨‍💻" },
                            { name: "Emma Wilson", role: "Designer", text: "Love the clean interface and personal recommendations. It feels like a premium shopping experience.", avatar: "👩‍🎨" }
                        ].map((testi, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-4xl mb-4">{testi.avatar}</div>
                                <p className="text-slate-600 italic mb-6">"{testi.text}"</p>
                                <div>
                                    <h4 className="font-bold text-slate-900">{testi.name}</h4>
                                    <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">{testi.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8. Newsletter Section */}
                <section className="mb-20">
                    <div className="bg-brand-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-700/50 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Stay in the Loop</h2>
                            <p className="text-brand-100 text-lg mb-10">Subscribe to our newsletter and get a 10% discount on your first purchase.</p>
                            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-grow bg-white/10 border border-white/20 backdrop-blur-md px-6 py-4 rounded-2xl text-white placeholder:text-brand-200 outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                                    required
                                />
                                <button className="bg-white text-brand-600 hover:bg-slate-50 px-10 py-4 rounded-2xl font-black transition-all shadow-xl">
                                    Subscribe Now
                                </button>
                            </form>
                            <p className="text-brand-200 text-xs mt-6 italic">We respect your privacy. Unsubscribe at any time.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
