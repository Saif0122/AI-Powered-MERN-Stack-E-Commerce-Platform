import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { Order } from '../types';

const TrackingPage: React.FC = () => {
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
                setError(err.response?.data?.message || 'Failed to load tracking info');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const steps = [
        { status: 'processing', label: 'Processing', description: 'Your order is being prepared', icon: '⚙️' },
        { status: 'shipped', label: 'Shipped', description: 'Package is on its way', icon: '🚚' },
        { status: 'delivered', label: 'Delivered', description: 'Arrived at your destination', icon: '🎁' }
    ];

    const currentStepIndex = order ? steps.findIndex(s => s.status === order.orderStatus) : -1;

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
            <div className="h-10 bg-slate-100 w-1/2 mb-8 rounded"></div>
            <div className="h-80 bg-slate-50 rounded-[40px]"></div>
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
            <div className="mb-12 text-center">
                <Link to={`/dashboard/orders/${order.id}`} className="text-brand-600 font-bold text-sm mb-4 inline-block hover:underline">← View Order Details</Link>
                <h1 className="text-5xl font-black text-slate-900 mb-4">Track Shipment</h1>
                <div className="inline-flex items-center gap-3 bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tracking ID</span>
                    <span className="text-lg font-black text-slate-900">{order.trackingNumber}</span>
                </div>
            </div>

            <div className="card bg-white p-12 rounded-[50px] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <span className="text-8xl opacity-10 grayscale">📦</span>
                </div>

                {/* Timeline UI */}
                <div className="relative z-10 space-y-20">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.status} className="flex gap-8 group">
                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl transition-all duration-500 shadow-xl ${isCompleted
                                            ? 'bg-brand-600 text-white scale-110 shadow-brand-200'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100'
                                        }`}>
                                        {step.icon}
                                    </div>
                                    {!isLast && (
                                        <div className={`w-1 flex-grow my-4 rounded-full transition-all duration-1000 ${index < currentStepIndex ? 'bg-brand-600' : 'bg-slate-100'
                                            }`} style={{ minHeight: '80px' }}></div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-2xl font-black tracking-tight ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {step.label}
                                        </h3>
                                        {isCurrent && (
                                            <span className="bg-brand-100 text-brand-600 text-[10px] font-black px-3 py-1 rounded-full uppercase animate-pulse">
                                                Ongoing
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-lg font-medium ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                                        {step.description}
                                    </p>
                                    {isCurrent && (
                                        <p className="mt-4 text-sm font-bold text-brand-600 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
                                            Updated {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-12 text-center text-slate-400">
                <p className="text-sm font-bold uppercase tracking-widest mb-2">Estimated delivery</p>
                <p className="text-2xl font-black text-slate-900">Thursday, 5th March 2026</p>
            </div>
        </div>
    );
};

export default TrackingPage;
