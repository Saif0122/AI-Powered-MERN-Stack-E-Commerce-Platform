import React, { useEffect, useState } from 'react';
import { Package, Trash2, Edit, Search, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const GlobalProductManagement: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data.products);
        } catch (err) {
            console.error('Failed to fetch global products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const deleteProduct = async (id: string) => {
        if (!window.confirm('IRREVERSIBLE_ACTION: Are you sure you want to purge this entity?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchAllProducts();
        } catch (err) {
            alert('Purge protocol failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-20 text-center animate-pulse">
            <h2 className="text-slate-400 font-black uppercase tracking-widest">Scanning_Global_Storage_Nodes...</h2>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">GLOBAL_INVENTORY_PROTOCOL</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-vendor storage monitor</p>
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH_BY_UID_OR_TITLE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 font-bold text-xs tracking-widest focus:outline-none focus:border-brand-500 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ENTITY</th>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">VENDOR_NODE</th>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">STOCK</th>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">ECON_VAL</th>
                                <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">DIRECTIVES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 md:px-10 py-6 md:py-8">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-[1rem] md:rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 group-hover:border-brand-300 transition-all shadow-inner">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-slate-300" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-base md:text-lg tracking-tighter flex items-center gap-1.5 md:gap-2">
                                                    {product.title}
                                                    {product.stock <= 5 && <AlertCircle className="text-rose-500" size={14} />}
                                                </div>
                                                <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">UID_{product._id.substring(0, 10)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-6 md:py-8">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] md:text-xs font-black text-slate-700 uppercase">{product.vendor?.name || 'ROOT_SYS'}</span>
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 tracking-tighter">NODE_ID: {product.vendor?._id?.substring(0, 8) || 'SYSTEM'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                        <span className={`inline-flex px-3 md:px-4 py-1 rounded-full font-black text-[10px] md:text-xs ${product.stock === 0 ? 'bg-rose-100 text-rose-600' :
                                            product.stock <= 5 ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-900 text-white'
                                            }`}>
                                            {product.stock}U
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                        <span className="font-black text-slate-900 font-mono text-base md:text-lg tracking-tighter">${product.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                                        <div className="flex justify-end gap-2 md:gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all">
                                            <button className="p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">
                                                <Edit size={16} className="md:w-[18px] md:h-[18px]" />
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product._id)}
                                                className="p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GlobalProductManagement;
