import { useState, useEffect, useCallback } from 'react';
import {
    Package, DollarSign, TrendingUp, AlertTriangle,
    Download, Plus, LayoutGrid, List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import analyticsService from '../../services/analyticsService';
import { useSocketAlert } from '../../hooks/useSocketAlert';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';

const SellerDashboard: React.FC = () => {
    useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedTab, setSelectedTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
    const [products, setProducts] = useState<Product[]>([]); // Retained for inventory tab
    const { alerts: socketAlerts, dismissAlert } = useSocketAlert();
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ stock?: number; price?: number }>({});

    const fetchData = useCallback(async () => {
        try {
            const [productsData, statsData] = await Promise.all([
                vendorService.getVendorProducts(),
                analyticsService.getVendorStats()
            ]);
            setProducts(productsData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch vendor dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (socketAlerts.length > 0) {
            fetchData();
        }
    }, [socketAlerts, fetchData]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product._id);
        setEditValues({ stock: product.stock, price: product.price });
    };

    const handleSave = async (id: string) => {
        try {
            await vendorService.updateInventory(id, editValues);
            setEditingProduct(null);
            fetchData();
        } catch (err) {
            alert('Failed to update inventory');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">VENDOR_ANALYTICS_HIVE</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1">Strategic store performance matrix</p>
                </div>
                <div className="flex gap-3 md:gap-4 w-full md:w-auto">
                    <Link to="/dashboard/add-product" className="flex-grow md:flex-grow-0 bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                        <Plus size={16} /> Add Product
                    </Link>
                    <button className="p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all text-slate-600">
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-xl rounded-2xl md:rounded-3xl">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-brand-50 text-brand-600 rounded-xl md:rounded-2xl">
                            <DollarSign size={20} className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <h4 className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Total Sales</h4>
                    <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">${stats?.totalSales?.toLocaleString()}</p>
                </div>

                <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-xl rounded-2xl md:rounded-3xl">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl">
                            <Package size={20} className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <h4 className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Total Orders</h4>
                    <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">{stats?.orderCount}</p>
                </div>

                <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-xl rounded-2xl md:rounded-3xl">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
                            <TrendingUp size={20} className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <h4 className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Units Sold</h4>
                    <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">{stats?.unitsSold}</p>
                </div>

                <div className="card p-5 md:p-6 bg-rose-50 border border-rose-100 shadow-xl rounded-2xl md:rounded-3xl">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="p-2.5 md:p-3 bg-rose-500 text-white rounded-xl md:rounded-2xl">
                            <AlertTriangle size={20} className="md:w-6 md:h-6" />
                        </div>
                    </div>
                    <h4 className="text-rose-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Critical Stock</h4>
                    <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter text-rose-600">{stats?.lowStockItems}</p>
                </div>
            </div>

            {/* Socket Alerts */}
            {socketAlerts.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                        <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Priority_Telemetry_Alerts</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {socketAlerts.map((alert) => (
                            <div key={`${alert.productId}-${alert.timestamp}`} className="bg-white border-2 border-rose-500 p-5 rounded-[2rem] flex justify-between items-center shadow-lg hover:translate-y-[-4px] transition-all">
                                <div>
                                    <p className="text-rose-600 font-black text-xs uppercase tracking-tighter">LOW_STOCK: {alert.title}</p>
                                    <p className="text-slate-400 text-[10px] font-bold">REMAINING: {alert.stock} UNITS</p>
                                </div>
                                <button
                                    onClick={() => dismissAlert(alert.productId)}
                                    className="p-2 hover:bg-rose-50 rounded-xl text-rose-300 hover:text-rose-500 transition-all"
                                >
                                    <Package size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dashboard Navigation Tabs */}
            <div className="flex gap-4 md:gap-8 border-b border-slate-100 overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => setSelectedTab('inventory')}
                    className={`pb-4 px-2 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${selectedTab === 'inventory' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setSelectedTab('orders')}
                    className={`pb-4 px-2 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${selectedTab === 'orders' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Order Fulfillment
                </button>
            </div>

            {selectedTab === 'inventory' ? (
                /* Inventory Monitoring Matrix */
                <div className="card bg-white border border-slate-100 shadow-2xl rounded-[2rem] md:rounded-[40px] overflow-hidden">
                    <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">INVENTORY_MONITORING_MATRIX</h3>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live storage node connection active</p>
                        </div>
                        <div className="flex items-center bg-white p-1 rounded-xl md:rounded-2xl border border-slate-200/60 shadow-inner">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </div>


                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/20">
                                    <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">PRODUCT_ENTITY</th>
                                    <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center border-b border-slate-100">STOCK_QUANTUM</th>
                                    <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center border-b border-slate-100">VALUATION</th>
                                    <th className="px-6 md:px-10 py-4 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right border-b border-slate-100">DIRECTIVES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((product) => (
                                    <tr key={product._id} className={`group hover:bg-slate-50/50 transition-all ${product.stock <= (product.lowStockThreshold || 5) ? 'bg-rose-50/20' : ''}`}>
                                        <td className="px-6 md:px-10 py-6 md:py-8">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-lg shadow-inner group-hover:bg-white transition-all">📦</div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-slate-900 text-sm md:text-lg tracking-tighter truncate">{product.title}</div>
                                                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                        {typeof product.category === 'string' ? product.category : product.category?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                            {editingProduct === product._id ? (
                                                <input
                                                    type="number"
                                                    value={editValues.stock}
                                                    onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) })}
                                                    className="w-16 md:w-24 bg-white border-2 border-slate-900 rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2 text-center font-black focus:outline-none text-sm md:text-base"
                                                />
                                            ) : (
                                                <span className={`inline-flex px-3 md:px-4 py-1 md:py-1.5 rounded-full font-black text-[10px] md:text-xs transition-all ${product.stock <= (product.lowStockThreshold || 5)
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {product.stock}U
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                                            {editingProduct === product._id ? (
                                                <input
                                                    type="number"
                                                    value={editValues.price}
                                                    onChange={(e) => setEditValues({ ...editValues, price: parseFloat(e.target.value) })}
                                                    className="w-20 md:w-28 bg-white border-2 border-slate-900 rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2 text-center font-black focus:outline-none text-sm md:text-base"
                                                />
                                            ) : (
                                                <span className="font-black text-slate-900 font-mono text-sm md:text-lg tracking-tighter">${product.price.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                                            {editingProduct === product._id ? (
                                                <div className="flex justify-end gap-2 md:gap-3">
                                                    <button
                                                        onClick={() => handleSave(product._id)}
                                                        className="bg-brand-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        COMMIT
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingProduct(null)}
                                                        className="text-slate-400 hover:text-slate-900 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        ABORT
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="border-2 border-slate-900 text-slate-900 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm whitespace-nowrap"
                                                >
                                                    EDIT_UNIT
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card p-12 bg-white border border-slate-100 shadow-2xl rounded-[40px] text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📦</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Order Fulfillment Hub</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Track and manage orders for your products. This feature is being synchronized with the global logistics network.</p>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
