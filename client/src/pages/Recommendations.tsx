import React, { useState } from 'react';
import { safeApi } from '../services/safeApi';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Recommendations: React.FC = () => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAiSearch, setIsAiSearch] = useState(true);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            // If search is empty, fetch popular products
            setLoading(true);
            setError(null);
            setIsAiSearch(true);
            try {
                const response = await safeApi.get<any>(`/recommendations/popular`);
                if (response.ok) {
                    setProducts(response.data.data.recommendations);
                } else {
                    setError('Failed to fetch recommendations. Backend might be down.');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await safeApi.get<any>(`/recommendations?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                setProducts(response.data.data.recommendations);
                setIsAiSearch(response.data.isAiSearch);

                if (response.data.isAiSearch === false && response.data.results > 0) {
                    // We don't set a hard error, just a notification state could be used
                    // For now, satisfy "Show user-friendly message"
                    console.log('Gemini AI unavailable, showing standard results.');
                }
            } else {
                setError(response.error?.response?.data?.message || 'Failed to fetch recommendations. Backend might be down.');
                console.error('Search Error:', response.error);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error('Search System Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load popular products on initial mount
    React.useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            try {
                const response = await safeApi.get<any>(`/recommendations/popular`);
                if (response.ok) {
                    setProducts(response.data.data.recommendations);
                }
            } catch (err) {
                console.error('Failed to load initial products', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
                    Semantic <span className="text-brand-600">AI Search</span>
                </h1>
                <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">
                    MercatoX understands your needs. Describe what you're looking for in natural language.
                </p>
            </div>

            <div className="max-w-3xl mx-auto mb-12">
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        className="input pr-32 py-4 text-lg shadow-lg group-hover:border-brand-600"
                        placeholder="e.g. 'A high-performance laptop for video editing' or 'Sustainable camping gear'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 btn btn-primary px-8 flex items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            'Search'
                        )}
                    </button>
                </form>
            </div>

            {isAiSearch === false && products.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0 text-amber-400 text-xl">
                            💡
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-700 font-bold">
                                AI search is temporarily unavailable. Showing normal search results.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0 text-red-400">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card h-96 animate-pulse bg-slate-100" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : query && !loading ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-bold text-slate-900">No matching products found</h3>
                    <p className="text-slate-500 mt-2">Try describing your search in a different way.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 text-2xl">🧠</div>
                        <div>
                            <h4 className="font-bold text-slate-900">Semantic Matching</h4>
                            <p className="text-sm text-slate-500 mt-1">We search concepts, not just keywords.</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600 text-2xl">⚡</div>
                        <div>
                            <h4 className="font-bold text-slate-900">Instant Results</h4>
                            <p className="text-sm text-slate-500 mt-1">Powered by MongoDB Atlas Vector Search.</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 text-2xl">🛍️</div>
                        <div>
                            <h4 className="font-bold text-slate-900">Tailored Marketplace</h4>
                            <p className="text-sm text-slate-500 mt-1">Personalized products for your unique needs.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recommendations;
