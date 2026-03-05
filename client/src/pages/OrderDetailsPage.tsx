import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Order } from '../types';

const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.data.order);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
            <div className="h-10 bg-slate-100 w-1/2 mb-8 rounded"></div>
            <div className="h-64 bg-slate-50 rounded-3xl mb-8"></div>
            <div className="h-40 bg-slate-50 rounded-3xl"></div>
        </div>
    );

    if (error || !order) return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Error</h2>
            <p className="text-slate-500 mb-8">{error || 'Order not found'}</p>
            <Link to="/dashboard/orders" className="btn btn-primary px-8 py-3">Back to Orders</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <Link to="/dashboard/orders" className="text-brand-600 font-bold text-sm mb-4 block hover:underline">← Back to history</Link>
                    <h1 className="text-4xl font-black text-slate-900">Order Summary</h1>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">Order ID</p>
                    <p className="text-xl font-black text-slate-900">#{order.id.toUpperCase()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2 space-y-6">
                    <div className="card bg-white p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold mb-6">Items Ordered</h3>
                        <div className="divide-y divide-slate-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 py-6 first:pt-0 last:pb-0">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                        <img src={item.product.images?.[0]} alt={item.product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">{item.product.title}</h4>
                                        <p className="text-slate-400 font-medium">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-slate-400 font-bold">${item.price.toFixed(2)} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card bg-slate-50 p-6 border border-slate-100">
                        <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
                        <div className="text-sm space-y-1 text-slate-600">
                            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="font-bold text-xs uppercase tracking-widest mt-2">{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="card bg-brand-600 text-white p-6 shadow-xl shadow-brand-100">
                        <h3 className="text-lg font-bold mb-4 opacity-80">Payment Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-bold">FREE</span>
                            </div>
                            <div className="pt-3 border-t border-white/20 flex justify-between text-lg font-black">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            <span className="text-xs font-black uppercase tracking-widest">Payment {order.paymentStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-white p-8 border border-slate-100 border-l-4 border-l-brand-600 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Track your package</p>
                    <p className="text-xl font-black text-slate-900">Current Status: {order.orderStatus.toUpperCase()}</p>
                </div>
                <Link to={`/dashboard/orders/${order.id}/track`} className="btn btn-primary px-8 py-3 font-bold">Track Shipment</Link>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
