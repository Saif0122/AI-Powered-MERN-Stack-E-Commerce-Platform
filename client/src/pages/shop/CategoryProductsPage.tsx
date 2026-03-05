import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import type { Product } from '../../types';

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
                console.error('CategoryId is missing');
                setError('Category ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log(`Fetching products for category: ${categoryId}`);
                const data = await productService.getProductsByCategory(categoryId);
                setProducts(data);
                if (data.length === 0) {
                    console.log('No products available in this category yet.');
                }
            } catch (err: any) {
                console.error('API Error fetching category products:', err);
                setError('Failed to load products for this category. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const categoryName = getCategoryName();

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
                <Link to="/shop" className="hover:text-brand-600">Shop</Link>
                <span>/</span>
                <span className="capitalize">{categoryName}</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-8 capitalize">
                {categoryName} Collection
            </h1>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-6 rounded-3xl mb-8 flex items-center gap-4 animate-shake">
                    <span className="text-2xl">⚠️</span>
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((p) => (
                        <div key={p._id} className="group bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all block">
                            <div className="aspect-[4/3] bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-100/50 flex items-center justify-center">
                                {p.images && p.images[0] ? (
                                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <span className="text-5xl opacity-40">📦</span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 truncate">{p.title}</h3>
                            <p className="text-brand-600 font-extrabold mt-1">${p.price}</p>
                            <Link to={`/shop/product/${p._id}`} className="mt-4 btn btn-primary w-full text-center py-2 text-sm">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                !error && (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <span className="text-6xl mb-4 block">📂</span>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">ARCHIVE_EMPTY</h2>
                        <p className="text-slate-500 font-medium">No products available in this category yet.</p>
                        <Link to="/shop" className="inline-block mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                            Browse All Categories
                        </Link>
                    </div>
                )
            )}
        </div>
    );
};

export default CategoryProductsPage;
