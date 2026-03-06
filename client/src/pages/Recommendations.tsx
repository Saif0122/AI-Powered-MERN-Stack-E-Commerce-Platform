import React, { useState } from 'react';
import { safeApi } from '../services/safeApi';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import SEO from '../components/common/SEO';
import { Sparkles, Zap, Brain, Rocket, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { ProductCardSkeleton } from '../components/common/Skeleton';

const Recommendations: React.FC = () => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAiSearch, setIsAiSearch] = useState(true);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            fetchInitial();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await safeApi.get<any>(`/recommendations?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                setProducts(response.data.data.recommendations);
                setIsAiSearch(response.data.isAiSearch);
            } else {
                setError(response.error?.response?.data?.message || 'Failed to initialize neural discovery');
            }
        } catch (err: any) {
            setError(err.message || 'Discovery engine synchronization failure');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitial = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await safeApi.get<any>(`/recommendations/popular`);
            if (response.ok) {
                setProducts(response.data.data.recommendations);
            }
        } catch (err) {
            console.error('Initial discovery failure', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchInitial();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <SEO
                title="AI Neural Discovery"
                description="Experience semantic product discovery powered by high-level AI matching."
            />

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 bg-brand-100/50 border border-brand-200 px-4 py-2 rounded-full text-brand-700 font-black text-[10px] uppercase tracking-[0.2em] mb-8 shadow-sm">
                        <Sparkles size={14} className="animate-pulse" />
                        Next-Gen Neural Discovery
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                        Describe Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">Ideal Gear</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        Skip the keywords. Describe what you need in natural language, and our AI will compute the perfect matches from our global catalog.
                    </p>
                </div>

                {/* Search Container */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div className="bg-white/40 backdrop-blur-3xl p-4 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50">
                        <form onSubmit={handleSearch} className="group flex items-center bg-white rounded-[2.5rem] p-2 shadow-inner border border-slate-100 gap-2 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                            <div className="pl-6 text-slate-400">
                                <Brain size={24} className="group-focus-within:text-brand-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="flex-grow bg-transparent border-none outline-none py-5 px-4 text-xl font-bold placeholder:text-slate-300 text-slate-900"
                                placeholder="e.g. 'A mirrorless camera for cinematic travel vlogs'..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 hover:bg-brand-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl flex items-center gap-3 disabled:opacity-50 group/btn active:scale-95"
                            >
                                {loading ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : (
                                    <>
                                        Run Query
                                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* AI Suggestion Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Try Discovery:</span>
                        {[
                            "High-performance workstations",
                            "Minimalist desk setup",
                            "Cinematic lenses",
                            "Smart home hub"
                        ].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setQuery(tag)}
                                className="bg-white px-6 py-2.5 rounded-full border border-slate-100 text-sm font-bold text-slate-600 hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Messages */}
                {isAiSearch === false && products.length > 0 && (
                    <div className="max-w-4xl mx-auto bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4 mb-16 shadow-sm">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-amber-900 font-black text-sm uppercase tracking-tight mb-1">Standard Retrieval Active</p>
                            <p className="text-amber-700/80 text-sm font-medium">Semantic neural matching is temporarily locked. Providing optimized keyword-based results.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 p-8 rounded-[3rem] text-center mb-16">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 text-2xl font-black">!</div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Discovery Protocol Aborted</h3>
                        <p className="text-red-600/70 font-medium">{error}</p>
                    </div>
                )}

                {/* Results Section */}
                <div className="space-y-12">
                    <div className="flex items-end justify-between border-b border-slate-200 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                {query ? 'Computed Matches' : 'Market Insight'}
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">
                                {products.length} assets identified in active catalog
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                            Sorted by Relevance Score
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-50 to-transparent"></div>
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-slate-200">🔍</div>
                                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Semantic Gap Detected</h3>
                                <p className="text-slate-500 max-w-md mx-auto text-lg font-medium leading-relaxed"> No products currently align with your description. Try adjusting your parameters or exploring specialized categories. </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Capabilities Grid */}
                {!query && !loading && products.length > 0 && (
                    <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Brain size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Semantic Engine</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">We search for the intent behind your query, matching complex requirements instead of just strings.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                                <Rocket size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Atlas Vector Index</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Utilizing high-dimensional vector search to find products with the highest similarity score.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                <MessageSquare size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">NLP Interpretation</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">Type naturally. Our system interprets descriptions like 'budget-friendly' or 'luxury performance' with precision.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
