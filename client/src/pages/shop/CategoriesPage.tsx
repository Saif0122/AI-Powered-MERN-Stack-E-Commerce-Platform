import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryService, { type Category } from '../../services/categoryService';
import { CategorySkeleton } from '../../components/common/Skeleton';
import SEO from '../../components/common/SEO';
import { Layers, ChevronRight, Sparkles, Box, Laptop, Shirt, Home, Zap } from 'lucide-react';

const categoryIcons: Record<string, any> = {
    'Electronics': Laptop,
    'Fashion': Shirt,
    'Home & Garden': Home,
    'Other': Box,
};

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-8 py-24">
                    <div className="animate-pulse space-y-4 mb-20">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-16 bg-slate-100 rounded w-96"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CategorySkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            <SEO
                title="Sectors | MercatoX Premium AI Marketplace"
                description="Browse our specialized product sectors. From high-end electronics to designer fashion."
            />

            {/* Premium Header */}
            <div className="relative bg-slate-950 pt-32 pb-48 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 blur-[130px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-brand-500 font-black uppercase tracking-widest text-[10px] mb-8">
                        <Layers size={12} fill="currentColor" /> Market Segmentation
                    </div>
                    <h1 className="text-8xl font-black text-white tracking-tighter leading-none mb-8">
                        Specialized <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-white">Sectors</span>
                    </h1>
                    <p className="text-white/40 max-w-2xl mx-auto text-xl font-medium italic mb-12">
                        Navigate our high-level catalog by sector. Each category represents a verified ecosystem of premium assets tailored for specific procurement needs.
                    </p>
                    <div className="flex items-center justify-center gap-8 text-white/20">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">AI Categorized</span>
                        </div>
                        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Zap size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Real-time Stock</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat.name] || Box;
                        return (
                            <Link
                                key={cat._id}
                                to={`/shop/category/${cat._id}`}
                                className="group relative bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-brand-600 transition-all duration-700 shadow-2xl shadow-slate-900/5 hover:shadow-brand-900/10 overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>

                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 mb-8 border border-slate-100 group-hover:bg-brand-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                    <Icon size={32} />
                                </div>

                                <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight group-hover:text-brand-600 transition-colors">
                                    {cat.name}
                                </h3>

                                <p className="text-slate-500 font-medium italic mb-10 flex-grow">
                                    Explore our curated select of {cat.name.toLowerCase()} assets.
                                </p>

                                <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all opacity-0 group-hover:opacity-100">
                                    Open Sector <ChevronRight size={14} />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm text-4xl">📂</div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Inventory Void</h2>
                        <p className="text-slate-500 font-medium italic text-lg max-w-md mx-auto">
                            Our neural index is currently recalibrating. No sectors are available for display at this moment.
                        </p>
                        <Link to="/" className="inline-block mt-12 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl">
                            Return to Command Center
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Sector Insight */}
            <div className="max-w-7xl mx-auto px-8 mt-32">
                <div className="bg-slate-950 rounded-[4rem] p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-8">
                                Specialized <br /> Procurement
                            </h2>
                            <p className="text-white/40 text-lg font-medium italic leading-relaxed">
                                Our sector-based categorization is powered by advanced neural mapping, ensuring you find the exact premium assets required for your operations.
                            </p>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-8">
                            {[
                                { label: 'Verified Sellers', value: '100%' },
                                { label: 'Asset Integrity', value: 'Level 5' },
                                { label: 'Global Logistics', value: 'Active' },
                                { label: 'Secured Data', value: 'Encrypted' }
                            ].map((stat) => (
                                <div key={stat.label} className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                                    <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-2">{stat.label}</p>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;
