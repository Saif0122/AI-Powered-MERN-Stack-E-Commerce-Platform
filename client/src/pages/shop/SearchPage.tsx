import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { Search, SlidersHorizontal, PackageSearch, Sparkles, ChevronRight } from 'lucide-react';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Assuming searchProducts exists or using generic fetch
                const data = await productService.searchProducts(query);
                setProducts(data);
            } catch (err: any) {
                setError('Failed to execute search algorithm. Connection fault.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-24">
                    <div className="animate-pulse space-y-6 mb-20">
                        <div className="h-4 bg-slate-100 rounded w-32"></div>
                        <div className="h-20 bg-slate-100 rounded w-[600px]"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!query) {
        return (
            <EmptyState
                icon={Search}
                title="Search Algorithm Inactive"
                description="Initialize a query to activate the search engine. Our AI index will find the most relevant assets for your procurement needs."
                actionText="Enter Marketplace"
                actionLink="/shop"
            />
        );
    }

    if (products.length === 0 && !error) {
        return (
            <EmptyState
                icon={PackageSearch}
                title="Zero Results Detected"
                description={`Our neural index found no assets matching "${query}". Try refining your search parameters or check our featured sector.`}
                actionText="View All Assets"
                actionLink="/shop"
            />
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <SEO
                title={`Search: ${query} | MercatoX`}
                description={`Search results for "${query}" on MercatoX Premium AI Marketplace.`}
            />

            {/* Premium Search Header */}
            <div className="bg-slate-950 pt-32 pb-48 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-brand-600 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="flex items-center gap-2 text-brand-500 font-black uppercase tracking-widest text-[10px] mb-8">
                        <Link to="/shop" className="hover:text-white transition-colors text-white/40">Marketplace</Link>
                        <ChevronRight size={10} className="text-white/20" />
                        <span className="text-white">Neural Search</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <div className="space-y-6">
                            <h1 className="text-7xl font-black text-white tracking-tighter leading-none">
                                Results for <br />
                                <span className="text-brand-500 italic block mt-2">"{query}"</span>
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-white/60 text-sm font-bold">
                                    <Sparkles size={16} className="text-brand-500" /> AI Ranked Results
                                </div>
                                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-white/60 text-sm font-bold">
                                    {products.length} Matches Found
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-black text-white/40 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-brand-600 flex items-center justify-center text-[10px] font-black text-white">
                                    +824
                                </div>
                            </div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-right">
                                Users searching similar sectors
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-8 -mt-24 relative z-20">
                <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-900/10 border border-slate-100">
                    <div className="flex items-center justify-between mb-16 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100">
                                <Search size={22} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-none mb-1">Logic Matching</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inventory Visualization</p>
                            </div>
                        </div>

                        <button className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                            <SlidersHorizontal size={16} /> Advanced Parameters
                        </button>
                    </div>

                    {error ? (
                        <div className="py-24 text-center">
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl">⚠️</div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">System Malfunction</h3>
                            <p className="text-slate-500 italic max-w-md mx-auto text-lg mb-10">{error}</p>
                            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-600 transition-all">Re-initialize Engine</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="mt-20 p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm">💡</div>
                        <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Search Optimization Tip</h4>
                            <p className="text-slate-500 font-medium italic">Try using specific asset IDs or sector categories for more precise results.</p>
                        </div>
                    </div>
                    <Link to="/shop" className="text-brand-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all flex items-center gap-2">
                        Back to Sector Overview <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
