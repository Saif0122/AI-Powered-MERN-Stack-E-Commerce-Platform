import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { ChevronRight, Filter, Layers, LayoutGrid } from 'lucide-react';

const CategoryProductsPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper to get category name safely
    const getCategoryName = () => {
        if (products.length === 0) return 'Category';
        const cat = products[0].category;
        if (cat && typeof cat === 'object') {
            return cat.name;
        }
        return 'Category';
    };

    useEffect(() => {
        const fetchProducts = async () => {
            if (!categoryId) {
                setError('Category ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await productService.getProductsByCategory(categoryId);
                setProducts(data);
            } catch (err: any) {
                setError('Failed to load products for this category. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    const categoryName = getCategoryName();

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-20">
                    <div className="animate-pulse space-y-4 mb-20">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-16 bg-slate-100 rounded w-96"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!loading && products.length === 0 && !error) {
        return (
            <EmptyState
                icon={Layers}
                title="Category Archive Empty"
                description="We haven't cataloged any assets in this specific sector yet. Explore other segments or check back during our next synchronization."
                actionText="View All Collections"
                actionLink="/shop"
            />
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <SEO
                title={`${categoryName} | MercatoX Premium`}
                description={`Explore our curated collection of high-value assets in the ${categoryName} category.`}
            />

            {/* Premium Header */}
            <div className="relative bg-slate-950 pt-32 pb-40 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="flex items-center gap-2 text-brand-500 font-black uppercase tracking-widest text-[10px] mb-6">
                        <Link to="/shop" className="hover:text-white transition-colors">Marketplace</Link>
                        <ChevronRight size={10} />
                        <span className="text-white/60">{categoryName}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-6 capitalize">
                                {categoryName} <br /> Sector
                            </h1>
                            <p className="text-white/40 max-w-xl text-lg font-medium italic">
                                Accessing the global reserve of specialized assets. Every item is verified for quality and logistical integrity.
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active Inventory</p>
                                <p className="text-3xl font-black text-white">{products.length} Units</p>
                            </div>
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-500 backdrop-blur-md">
                                <LayoutGrid size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-8 -mt-16 relative z-20">
                <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-slate-900/10 border border-slate-100">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-brand-600 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Available Assets</h2>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border border-slate-100">
                            <Filter size={14} /> Filter Logic
                        </button>
                    </div>

                    {error ? (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Synchronization Fault</h3>
                            <p className="text-slate-500 italic mb-8">{error}</p>
                            <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black">Reload Terminal</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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

export default CategoryProductsPage;
