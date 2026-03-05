import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../../services/api';
// Using console.error for simplicity if logger doesn't exist on client
const logger = { error: console.error };

interface VendorOrder {
    _id: string;
    totalAmount: number;
    orderStatus: 'pending' | 'shipped' | 'delivered';
    createdAt: string;
    items: any[];
    shippingAddress: any;
}

const VendorOrders: React.FC = () => {
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/vendor/orders');
            setOrders(response.data.data.orders);
        } catch (err) {
            logger.error('Failed to fetch vendor orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, status: string, trackingNumber?: string) => {
        setUpdatingId(orderId);
        try {
            await api.put(`/vendor/orders/${orderId}`, { orderStatus: status, trackingNumber });
            fetchOrders();
        } catch (err) {
            logger.error('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">ORDER_FULFILLMENT_HIVE</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Global logistics node management</p>
            </header>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="card p-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[40px]">
                        <p className="text-slate-400 font-black uppercase tracking-widest">No_Inbound_Orders_Detected</p>
                    </div>
                ) : orders.map((order) => (
                    <div key={order._id} className="card bg-white border border-slate-100 shadow-xl rounded-[40px] overflow-hidden group hover:border-brand-500/30 transition-all">
                        <div className="p-8 md:p-10 flex flex-col lg:flex-row justify-between gap-8">
                            <div className="space-y-6 flex-grow">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-900 text-white rounded-2xl">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            ORDER_{order._id.substring(order._id.length - 8).toUpperCase()}
                                            <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {order.orderStatus}
                                            </span>
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            Initiated: {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment_Details</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                    <span className="font-black text-xs text-slate-700">{item.product.title}</span>
                                                    <span className="font-black text-xs text-brand-600">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery_Protocol</h4>
                                        <div className="p-4 bg-slate-900 text-slate-300 rounded-3xl text-xs font-bold space-y-1">
                                            <p className="text-white font-black uppercase text-[10px] mb-2 tracking-widest opacity-50">Target_Coordinates</p>
                                            <p>{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.addressLine1}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0 lg:pl-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total_Valuation</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                </div>

                                <div className="space-y-3 mt-8 lg:mt-0">
                                    {order.orderStatus === 'pending' ? (
                                        <button
                                            onClick={() => updateStatus(order._id, 'shipped', `TRK-${Math.random().toString(36).substring(7).toUpperCase()}`)}
                                            disabled={updatingId === order._id}
                                            className="w-full bg-brand-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Truck size={18} /> {updatingId === order._id ? 'UPDATING...' : 'INITIATE_SHIPMENT'}
                                        </button>
                                    ) : order.orderStatus === 'shipped' ? (
                                        <button
                                            onClick={() => updateStatus(order._id, 'delivered')}
                                            disabled={updatingId === order._id}
                                            className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> {updatingId === order._id ? 'UPDATING...' : 'CONFIRM_DELIVERY'}
                                        </button>
                                    ) : (
                                        <div className="bg-green-50 text-green-600 py-4 rounded-3xl text-center font-black text-xs uppercase tracking-widest border border-green-100 flex items-center justify-center gap-2">
                                            <CheckCircle size={18} /> FULFILLMENT_COMPLETE
                                        </div>
                                    )}
                                    <button className="w-full text-slate-400 hover:text-slate-900 py-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1">
                                        VIEW_INVOICE <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorOrders;
