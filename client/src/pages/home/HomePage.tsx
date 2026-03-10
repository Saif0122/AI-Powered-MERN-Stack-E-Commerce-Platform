import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationsService } from '../../services/RecommendationsService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import type { Category } from '../../services/categoryService';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { Sparkles, TrendingUp, Award, Zap, ArrowRight, Mail, Star, Quote, ShieldCheck } from 'lucide-react';

const HomePage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [dealProducts, setDealProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [recTitle, setRecTitle] = useState('Recommended for You');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allCats, allProds, recs] = await Promise.all([
                    categoryService.getAllCategories(),
                    productService.getAllProducts(),
                    RecommendationsService.getPersonalizedRecommendations()
                ]);

                setCategories(allCats);
                setFeaturedProducts(allProds.slice(0, 8));
                setTrendingProducts(allProds.filter(p => (p.ratingsAverage || 0) >= 4).slice(0, 4));
                setDealProducts(allProds.filter(p => p.salePrice || (p.discountPercentage && p.discountPercentage > 0)).slice(0, 4));

                if (recs.ok && recs.data?.data?.recommendations?.length > 0) {
                    setRecommendedProducts(recs.data.data.recommendations);
                    setRecTitle('AI Recommendations');
                } else if (recs.data?.data?.products?.length > 0) {
                    setRecommendedProducts(recs.data.data.products);
                    setRecTitle('Popular Choices');
                }

            } catch (err) {
                console.error("Failed to fetch home data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const catIcons: Record<string, string> = {
        'Electronics': '📱',
        'Clothing': '👕',
        'Home & Garden': '🏡',
        'Beauty': '💄',
        'Sports': '⚽',
        'Toys': '🧸'
    };

    return (
        <div className="bg-slate-50">
            <SEO
                title="Premium AI E-Commerce Experience"
                description="Shop the future with MercatoX. Personalized AI recommendations and premium product discovery."
            />

            {/* 1. Premium Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-900">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-1"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full py-12 md:py-0">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md text-brand-400 text-[10px] font-black tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6 md:mb-8">
                            <Sparkles size={14} className="animate-pulse" />
                            Next-Gen Shopping Hub
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 md:mb-8 leading-[0.95] md:leading-[0.9] tracking-tighter">
                            Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Pure Commerce</span>
                        </h1>
                        <p className="text-base md:text-xl text-slate-400 mb-10 md:mb-12 leading-relaxed max-w-xl font-medium">
                            Experience the pinnacle of online shopping powered by intelligent AI discovery and a curated premium catalog.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                            <Link to="/shop" className="bg-brand-600 hover:bg-brand-700 text-white px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg transition-all transform hover:scale-105 shadow-2xl shadow-brand-600/30 flex items-center justify-center gap-3 group">
                                Explore Store
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5" />
                            </Link>
                            <Link to="/recommendations" className="bg-white/5 hover:bg-white/10 text-white backdrop-blur-xl px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg transition-all border border-white/10 flex items-center justify-center gap-3">
                                <Zap size={18} className="text-brand-400 md:w-5 md:h-5" />
                                AI Assistant
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Floating scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
                    <div className="w-1 h-12 bg-white rounded-full"></div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-24 space-y-16 md:space-y-32">

                {/* 2. Featured Grid */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-[10px] md:text-xs mb-3">
                                <Award size={14} className="md:w-4 md:h-4" /> Curated Picks
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950">Masterpiece Collection</h2>
                            <p className="text-slate-500 mt-2 md:mt-4 text-sm md:text-lg font-medium italic">Handpicked excellence from our global network of certified vendors.</p>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-2 text-slate-900 font-black hover:text-brand-600 transition-colors text-base md:text-lg">
                            See All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {loading ? (
                            Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : (
                            featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)
                        )}
                    </div>
                </section>

                {/* 3. Category Carousel/Grid */}
                <section>
                    <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950 mb-3 md:mb-4">Vertical Discovery</h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium italic">Navigate through our meticulously organized product tiers.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
                        ) : (
                            categories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    to={`/shop/category/${cat._id}`}
                                    className="group bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:bg-brand-50 transition-colors relative">
                                        <span className="text-2xl md:text-4xl filter group-hover:scale-110 transition-transform">
                                            {catIcons[cat.name] || '📦'}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-slate-900 group-hover:text-brand-600 transition-colors tracking-tight text-xs md:text-base uppercase md:normal-case">{cat.name}</h3>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* 4. Trending - Premium Dark Layout */}
                <section>
                    <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 overflow-hidden relative shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 md:mb-16 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-400 font-black uppercase tracking-widest text-[10px] md:text-xs mb-4">
                                        <TrendingUp size={14} className="md:w-4 md:h-4" /> Velocity Engine
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">Market Heat</h2>
                                    <p className="text-slate-400 mt-2 md:mt-4 text-sm md:text-lg font-medium italic">Real-time trending assets identified by our global analytics.</p>
                                </div>
                                <Link to="/shop" className="text-white hover:text-brand-400 font-black flex items-center gap-2 transition-colors text-base md:text-lg">
                                    Flash Sale <ArrowRight size={18} className="md:w-5 md:h-5" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                {loading ? (
                                    Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                                ) : (
                                    trendingProducts.map((p) => <ProductCard key={p._id} product={p} />)
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. AI Recommendations */}
                {recommendedProducts.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8 md:mb-12">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                                <Zap size={20} className="md:w-6 md:h-6" fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950">{recTitle}</h2>
                                <p className="text-sm md:text-base text-slate-500 font-medium italic">Computed based on your unique style DNA</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {recommendedProducts.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
                        </div>
                    </section>
                )}

                {/* 6. Unbeatable Deals */}
                <section>
                    <div className="mb-8 md:mb-12">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950 mb-2">Maximum Value</h2>
                        <p className="text-sm md:text-lg text-slate-500 font-medium italic opacity-60">Elite products. Optimized pricing.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : dealProducts.length > 0 ? (
                            dealProducts.map((p) => <ProductCard key={p._id} product={p} />)
                        ) : (
                            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                                <p className="text-slate-400 font-black italic">Next flash drop occurring in T-minus 2 hours...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 7. Testimonials */}
                <section>
                    <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
                        <div className="inline-block px-4 py-1 bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6 italic">Social Proof</div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-950 mb-4">Consensus of Quality</h2>
                        <p className="text-slate-500 font-medium text-base md:text-lg italic">Trusted by the world's most discerning collectors and tech visionaries.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                        {[
                            { name: "Sarah Johnson", role: "Venture Architect", text: "The AI discovery engine is fundamentally different. It doesn't just show products; it identifies needs.", avatar: "https://i.pravatar.cc/150?u=sarah" },
                            { name: "Michael Chen", role: "UI/UX Specialist", text: "Impeccable execution. The logistics match the interface in terms of precision and speed.", avatar: "https://i.pravatar.cc/150?u=mike" },
                            { name: "Elena Vasquez", role: "Creative Director", text: "Finally, a platform that respects the aesthetic value of the products it lists.", avatar: "https://i.pravatar.cc/150?u=elena" }
                        ].map((testi, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 relative group">
                                <Quote className="absolute top-8 md:top-10 right-8 md:right-10 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity w-[50px] h-[50px] md:w-[60px] md:h-[60px]" strokeWidth={3} />
                                <div className="flex gap-1 text-amber-400 mb-6 md:mb-8">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" />)}
                                </div>
                                <p className="text-slate-700 text-lg md:text-xl font-medium leading-relaxed italic mb-8 md:mb-10 relative z-10 text-balance">
                                    "{testi.text}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <img src={testi.avatar} alt={testi.name} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-lg" />
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-none mb-1 text-sm md:text-base">{testi.name}</h4>
                                        <p className="text-[9px] md:text-xs text-brand-600 font-black uppercase tracking-widest">{testi.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8. Newsletter */}
                <section className="pb-10">
                    <div className="bg-brand-600 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-200">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 blur-[80px] rounded-full"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            {!subscribed ? (
                                <>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-6 md:mb-8 border border-white/20 italic">
                                        <Mail size={12} className="md:w-[14px] md:h-[14px]" /> Intelligence Feed
                                    </div>
                                    <h2 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-8 tracking-tighter">Stay Ahead of the Curve</h2>
                                    <p className="text-brand-50 text-base md:text-xl mb-8 md:mb-12 font-medium max-w-xl mx-auto italic opacity-90">Join our private network for early product access and AI-curated market reports.</p>
                                    <form
                                        className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            setSubscribed(true);
                                        }}
                                    >
                                        <input
                                            type="email"
                                            placeholder="Enter your professional email"
                                            className="flex-grow bg-white/10 border border-white/20 backdrop-blur-xl px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] text-white placeholder:text-brand-200 outline-none focus:ring-4 focus:ring-white/20 transition-all font-bold text-base md:text-lg"
                                            required
                                        />
                                        <button className="bg-white text-brand-600 hover:bg-slate-100 px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg transition-all shadow-2xl active:scale-95 whitespace-nowrap">
                                            Subscribe
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="space-y-6 py-6 animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                                        <ShieldCheck size={40} className="text-brand-600" />
                                    </div>
                                    <h2 className="text-5xl font-black text-white tracking-tighter">Protocol Initialized</h2>
                                    <p className="text-brand-50 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                                        Welcome to the network. Your credentials have been authenticated. Exclusive briefings will arrive in your inbox shortly.
                                    </p>
                                </div>
                            )}
                            <p className="text-brand-300 text-xs mt-10 font-bold uppercase tracking-widest italic flex items-center justify-center gap-2">
                                <Zap size={10} /> Exclusive insight — No spam guaranteed
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
