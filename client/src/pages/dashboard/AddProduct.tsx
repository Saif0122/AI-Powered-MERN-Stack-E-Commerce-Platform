import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, FileText, BarChart, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import vendorService from '../../services/vendorService';
import categoryService, { type Category } from '../../services/categoryService';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: ''
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to load categories. Please check your connection.');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const productToSave = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                images: formData.images.split(',').map(img => img.trim()).filter(img => img !== '')
            };

            await vendorService.createProduct(productToSave);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product. Please check your inputs.');
            console.error('Add Product Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
                <ArrowLeft size={14} /> Back to Hub
            </button>

            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVENTORY_GENESIS</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Deploy a new product entity to the marketplace</p>
            </header>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                    <span className="text-xl">⚠️</span>
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Basic Info */}
                <div className="space-y-6">
                    <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="text-brand-600" size={18} />
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Core_Specifications</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Title</label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-5 py-3 font-bold text-slate-900 transition-all outline-none"
                                    placeholder="e.g. Quantum X Headphones"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-5 py-3 font-bold text-slate-900 transition-all outline-none resize-none"
                                    placeholder="Technical capabilities and features..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-5 py-3 font-bold text-slate-900 transition-all outline-none appearance-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Valuatiton & Inventory */}
                <div className="space-y-6">
                    <div className="card p-8 bg-white border border-slate-100 shadow-xl rounded-[40px] space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart className="text-brand-600" size={18} />
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Market_Metrics</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Price ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl pl-10 pr-5 py-3 font-black text-slate-900 transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Stock Level</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        required
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl pl-10 pr-5 py-3 font-black text-slate-900 transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Image URLs (comma separated)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-4 text-slate-400" size={16} />
                                <textarea
                                    name="images"
                                    value={formData.images}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl pl-10 pr-5 py-3 font-bold text-slate-900 transition-all outline-none resize-none"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white p-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>INITIALIZE_PRODUCT_ENTRY</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
