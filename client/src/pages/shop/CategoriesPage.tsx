import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryService, { type Category } from '../../services/categoryService';

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
            <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Browse Categories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        to={`/shop/category/${cat._id}`}
                        className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-brand-600 hover:shadow-lg transition-all text-center group"
                    >
                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">
                            📦
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">{cat.name}</h3>
                        <p className="text-slate-500 mt-2">Explore {cat.name}</p>
                    </Link>
                ))}
            </div>
            {categories.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No categories found in the system.</p>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
