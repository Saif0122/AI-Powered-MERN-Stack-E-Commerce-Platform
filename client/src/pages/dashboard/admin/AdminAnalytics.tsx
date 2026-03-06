import { useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, ShoppingBag, DollarSign, Download,
    ChevronRight, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import api from '../../../services/api';
import { exportToCSV } from '../../../utils/exportUtils';

interface CategoryBreakdown {
    category: string;
    revenue: number;
    orders: number;
}

interface TopProduct {
    _id: string;
    title: string;
    price: number;
    viewCount: number;
}

interface AdminStats {
    totalRevenue: number;
    totalOrders: number;
    conversionRate: number;
    todayRevenue: number;
    categoryBreakdown: CategoryBreakdown[];
}

const AdminAnalytics = () => {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [range, setRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [statsRes, salesRes, productsRes] = await Promise.all([
                    api.get('/analytics/admin'),
                    api.get(`/analytics/sales?range=${range}`),
                    api.get('/analytics/top-products?limit=5')
                ]);

                setStats(statsRes.data.data);
                setSalesData(salesRes.data.data);
                setTopProducts(productsRes.data.data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [range]);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

    const handleExport = () => {
        const exportData = salesData.map(item => ({
            Date: item._id,
            Revenue: item.revenue,
            Orders: item.orders
        }));
        exportToCSV(exportData, `sales_report_${range}`);
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Analytics</h1>
                    <p className="text-gray-500 mt-1">Real-time performance metrics for MercatoX</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-100"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Total Revenue"
                    value={`$${stats?.totalRevenue?.toLocaleString()}`}
                    icon={<DollarSign className="text-indigo-600" />}
                    trend="+12.5%"
                    up={true}
                />
                <KPICard
                    title="Total Orders"
                    value={stats?.totalOrders}
                    icon={<ShoppingBag className="text-pink-600" />}
                    trend="+5.2%"
                    up={true}
                />
                <KPICard
                    title="Conversion Rate"
                    value={`${stats?.conversionRate}%`}
                    icon={<Activity className="text-violet-600" />}
                    trend="-1.2%"
                    up={false}
                />
                <KPICard
                    title="Today's Sales"
                    value={`$${stats?.todayRevenue?.toLocaleString()}`}
                    icon={<TrendingUp className="text-blue-600" />}
                    trend="+22.1%"
                    up={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue by Category</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.categoryBreakdown || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="revenue"
                                    nameKey="category"
                                >
                                    {(stats?.categoryBreakdown || []).map((_: CategoryBreakdown, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-4">
                        {stats?.categoryBreakdown?.slice(0, 3).map((cat: CategoryBreakdown, idx: number) => (
                            <div key={cat.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    {cat.category}
                                </div>
                                <span className="font-semibold text-gray-800">${cat.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Most Viewed Products</h3>
                        <button className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700">
                            View all <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-400 border-b border-gray-50 pb-3">
                                    <th className="pb-4 font-semibold uppercase tracking-wider">Product Name</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-right">Price</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-right">Views</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-right">Potential Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topProducts.map((product: TopProduct) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-sm font-medium text-gray-700">{product.title}</td>
                                        <td className="py-4 text-sm text-gray-600 text-right">${product.price.toLocaleString()}</td>
                                        <td className="py-4 text-sm text-gray-600 text-right">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                                                {product.viewCount}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm font-bold text-gray-800 text-right">
                                            ${(product.price * product.viewCount * 0.05).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Conversion Funnel Placeholder or Similar */}
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 opacity-90">Performance Tip</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                            Your conversion rate is <strong>{(stats?.conversionRate || 0).toFixed(1)}%</strong>.
                            Consider focusing on the top-performing category <strong>"{stats?.categoryBreakdown?.[0]?.category}"</strong>
                            to drive more revenue.
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-white/20 p-2 rounded-lg"><Activity size={24} /></div>
                            <div>
                                <div className="text-xs opacity-70">Efficiency Score</div>
                                <div className="text-2xl font-bold">84/100</div>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-white h-full" style={{ width: '84%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface KPICardProps {
    title: string;
    value: string | number | undefined;
    icon: ReactNode;
    trend?: string;
    up?: boolean;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, trend, up }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
                {icon}
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {up ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {trend}
            </div>
        </div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
);

export default AdminAnalytics;
