import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Order } from '../types';

const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/orders/my');
                setOrders(response.data.data.orders);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-amber-100 text-amber-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-black mb-10">Order History</h1>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-slate-50 rounded-3xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-black text-red-500 mb-4">Error</h2>
            <p className="text-slate-500">{error}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Order History</h1>
                    <p className="text-slate-500 font-medium">Manage and track your recent purchases</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 rounded-[40px] border border-slate-100">
                    <span className="text-7xl mb-6 block">🛍️</span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No orders found</h3>
                    <p className="text-slate-500 mb-8">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn btn-primary px-8 py-3">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="card bg-white p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex-grow space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-tighter">Order #{order.id.slice(-8).toUpperCase()}</span>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="flex -space-x-3 overflow-hidden">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <img
                                                key={idx}
                                                src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                                                alt="Preview"
                                                className="w-12 h-12 rounded-full border-2 border-white object-cover"
                                            />
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                                        <p className="text-sm text-slate-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                <p className="text-2xl font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                                <div className="flex gap-3">
                                    <Link to={`/dashboard/orders/${order.id}`} className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Details</Link>
                                    <Link to={`/dashboard/orders/${order.id}/track`} className="btn btn-primary px-4 py-2 text-xs font-black shadow-lg shadow-brand-100">Track Order</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
