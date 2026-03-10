import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { ChevronRight, Filter, ShoppingBag, LayoutGrid, Sparkles } from 'lucide-react';

const ShopPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await productService.getAllProducts();
                // Defensive check: ensure data is an array
                setProducts(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error("Shop fetch error:", err);
                setError('Failed to synchronize with the global inventory. Please verify your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
                    <div className="animate-pulse space-y-4 mb-16 md:mb-20">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-10 md:h-16 bg-slate-100 rounded w-full md:w-96"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-12">
                        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!loading && products.length === 0 && !error) {
        return (
            <EmptyState
                icon={ShoppingBag}
                title="Inventory Depleted"
                description="Our global warehouse is currently transitioning stock. No premium assets are available for immediate procurement at this moment."
                actionText="Back to Selection"
                actionLink="/"
            />
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <SEO
                title="Premium Marketplace | MercatoX AI"
                description="Access our full catalog of specialized premium assets. Verified quality, global logistics."
            />

            {/* Premium Header */}
            <div className="relative bg-slate-950 pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-600/10 blur-[80px] md:blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-600/5 blur-[60px] md:blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 text-brand-500 font-black uppercase tracking-widest text-[10px] mb-6 justify-center md:justify-start">
                        <Link to="/" className="hover:text-white transition-colors">Command Center</Link>
                        <ChevronRight size={10} />
                        <span className="text-white/60">Full Catalog</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="w-full">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-brand-400 font-black uppercase tracking-widest text-[10px] mb-4">
                                <Sparkles size={14} className="animate-pulse" />
                                AI-Curated Marketplace
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.95] md:leading-[0.9] mb-6">
                                Premium <br /> Marketplace
                            </h1>
                            <p className="text-white/40 max-w-xl text-sm md:text-lg font-medium italic mx-auto md:mx-0 leading-relaxed">
                                Access the complete global reserve of verified assets. Every item is cross-referenced for quality and logistical integrity.
                            </p>
                        </div>
                        <div className="flex flex-row md:flex-row items-center justify-center md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0">
                            <div className="text-center md:text-right">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Global Units</p>
                                <p className="text-2xl md:text-3xl font-black text-white">{products.length} Active</p>
                            </div>
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-500 backdrop-blur-md">
                                <LayoutGrid size={24} className="md:w-7 md:h-7" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-10 md:-mt-16 relative z-20">
                <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-12 shadow-2xl shadow-slate-900/10 border border-slate-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-brand-600 rounded-full"></div>
                            <h2 className="text-lg md:text-2xl font-black text-slate-950 tracking-tight">Verified Inventory</h2>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-50 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border border-slate-100">
                            <Filter size={12} className="md:w-[14px] md:h-[14px]" /> Refine Algorithm
                        </button>
                    </div>

                    {error ? (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Sync Fault</h3>
                            <p className="text-slate-500 italic mb-8">{error}</p>
                            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black">Reload Session</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
