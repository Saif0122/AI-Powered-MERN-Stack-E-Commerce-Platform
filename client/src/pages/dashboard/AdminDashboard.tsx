import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import {
    Users, DollarSign, ShoppingBag,
    TrendingUp, Activity
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import UserManagement from './admin/UserManagement';
import GlobalProductManagement from './admin/GlobalProductManagement';
import CouponManagement from './admin/CouponManagement';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'coupons'>('overview');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await analyticsService.getAdminStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-none">Command <span className="text-brand-600">Terminal</span></h1>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] mt-2">Authenticated: Platform Operations Override</p>
                </div>
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'users', label: 'User Index' },
                        { id: 'products', label: 'Global Catalog' },
                        { id: 'coupons', label: 'Promotions' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 md:px-8 py-2.5 md:py-3 rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' ? (
                <>
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] md:rounded-3xl group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 md:p-3 bg-brand-50 text-brand-600 rounded-[1.25rem] md:rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    <DollarSign size={20} className="md:w-6 md:h-6" />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                            </div>
                            <h4 className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Global Revenue</h4>
                            <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">${stats?.totalRevenue?.toLocaleString()}</p>
                        </div>

                        <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] md:rounded-3xl group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-[1.25rem] md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ShoppingBag size={20} className="md:w-6 md:h-6" />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-full">LIVE</span>
                            </div>
                            <h4 className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Total Orders</h4>
                            <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">{stats?.totalOrders?.toLocaleString()}</p>
                        </div>

                        <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] md:rounded-3xl group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-[1.25rem] md:rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                                    <Users size={20} className="md:w-6 md:h-6" />
                                </div>
                            </div>
                            <h4 className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Today's Revenue</h4>
                            <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">${stats?.todayRevenue?.toLocaleString()}</p>
                        </div>

                        <div className="card p-5 md:p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-[2rem] md:rounded-3xl group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-[1.25rem] md:rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Activity size={20} className="md:w-6 md:h-6" />
                                </div>
                            </div>
                            <h4 className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Today's Orders</h4>
                            <p className="text-xl md:text-2xl font-black mt-1 tracking-tighter">{stats?.todayOrders}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Revenue Over Time */}
                        <div className="card p-6 md:p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem] md:rounded-[40px]">
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">REVENUE_GROWTH_MATRIX</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 days performance</p>
                                </div>
                                <TrendingUp size={18} className="text-brand-500 md:w-5 md:h-5" />
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.revenueByDay}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            itemStyle={{ fontWeight: 800, color: '#0f172a' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#ec4899"
                                            strokeWidth={4}
                                            dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 8, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Orders by Status */}
                        <div className="card p-6 md:p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem] md:rounded-[40px]">
                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">OPERATIONAL_STATUS_PIE</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order distribution metrics</p>
                                </div>
                                <Activity size={18} className="text-blue-500 md:w-5 md:h-5" />
                            </div>
                            <div className="h-[300px] w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
                                <div className="w-full sm:w-2/3 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.ordersByStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="_id"
                                            >
                                                {stats?.ordersByStatus?.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full sm:w-1/3 flex flex-wrap sm:flex-col sm:space-y-3 gap-3 sm:gap-3 px-4">
                                    {stats?.ordersByStatus?.map((entry: any, index: number) => (
                                        <div key={entry._id} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-slate-600">{entry._id} ({entry.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Order Monitoring Simulation Panel */}
                    <div className="card p-6 md:p-8 bg-slate-900 text-white rounded-[2rem] md:rounded-[40px] shadow-2xl shadow-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                                <h3 className="text-base md:text-lg font-black tracking-tight uppercase">Live_Transaction_Stream</h3>
                            </div>
                            <button className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-white border border-slate-700 px-3 md:px-4 py-1 rounded-full tracking-widest transition-all">
                                CLEAR.LOGS
                            </button>
                        </div>
                        <div className="space-y-4 font-mono text-sm h-[200px] overflow-y-auto custom-scrollbar">
                            <div className="flex gap-4 p-3 bg-white/5 rounded-2xl items-center border border-white/5">
                                <span className="text-slate-500 text-[10px] font-bold">19:47:02</span>
                                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-black">STMT_OK</span>
                                <span className="text-slate-300 font-bold">New order initiated: ORD-99221-X ($452.00)</span>
                            </div>
                            <div className="flex gap-4 p-3 bg-white/5 rounded-2xl items-center border border-white/5">
                                <span className="text-slate-500 text-[10px] font-bold">19:45:12</span>
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black">LOG_INFO</span>
                                <span className="text-slate-300 font-bold">Cache refreshed for admin statistics (300ms)</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : activeTab === 'users' ? (
                <UserManagement />
            ) : activeTab === 'products' ? (
                <GlobalProductManagement />
            ) : (
                <CouponManagement />
            )}
        </div>
    );
};

export default AdminDashboard;
