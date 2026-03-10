import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import couponService from '../services/couponService';
import type { Coupon } from '../types';
import SEO from '../components/common/SEO';
import { ShieldCheck, Truck, Lock, CreditCard, ChevronLeft, Award, Zap, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Use a Stripe Test Public Key
const stripePromise = loadStripe('pk_test_51Pxy2fP8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7f8P7');

const CheckoutPage: React.FC = () => {
    const { cart } = useCart();
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIntent = async () => {
            try {
                setLoading(true);
                const response = await api.post('/payments/create-intent');
                setClientSecret(response.data.clientSecret);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to initialize payment gateway');
            } finally {
                setLoading(false);
            }
        };

        if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
            fetchIntent();
        } else if (cart && (!Array.isArray(cart.items) || cart.items.length === 0)) {
            setLoading(false);
        }
    }, [cart]);

    const handleApplyCoupon = async () => {
        if (!cart || !couponCode.trim()) return;
        try {
            setApplyingCoupon(true);
            setCouponError(null);
            const couponData = await couponService.applyCoupon(couponCode, cart.totalPrice);
            setAppliedCoupon(couponData);
        } catch (err: any) {
            setCouponError(err.response?.data?.message || 'Invalid promotion code');
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-pulse">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-100 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8">
                <ShieldCheck size={32} className="text-brand-600 animate-pulse md:w-10 md:h-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Initializing Order Security</h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">Authenticating payment gateway and secure tokens...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 md:mb-8 text-3xl md:text-4xl">⚠️</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Gateway Initialization Failed</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 md:mb-10 font-medium text-sm md:text-base">{error}</p>
            <Link to="/cart" className="bg-slate-900 text-white px-10 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl text-sm md:text-base">Back to Logistics</Link>
        </div>
    );

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 md:mb-8 text-4xl md:text-5xl grayscale opacity-20">🛒</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Procurement Stack Empty</h2>
            <p className="text-slate-500 mb-8 md:mb-10 font-medium text-sm md:text-base">Add assets to your order hierarchy to initialize checkout protocol.</p>
            <Link to="/shop" className="bg-brand-600 text-white px-10 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl text-sm md:text-base">Browse Catalog</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO title="Secure Checkout" description="Finalize your premium procurement via AI-secured gateway." />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16">
                <div className="flex items-center gap-4 mb-10 md:mb-16">
                    <Link to="/cart" className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-600 transition-all shadow-sm group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform md:w-6 md:h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1">Final Procurement</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID: MTX-SECURED</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
                    {/* Left: Payment Info */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Security Notice */}
                        <div className="bg-slate-950 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-slate-900/20">
                            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-brand-600/10 blur-2xl md:blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10 flex flex-row md:flex-row items-center md:items-start gap-4 md:gap-6">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-600/20 border border-brand-500/30 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-400 flex-shrink-0">
                                    <Lock size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 md:mb-2">Neural Link Secured</h2>
                                    <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
                                        Your transaction is protected by 256-bit SSL encryption.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Container */}
                        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm space-y-6 md:space-y-8">
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className="text-brand-600 md:w-5 md:h-5" />
                                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Payment Method</h3>
                            </div>

                            {clientSecret && (
                                <div className="checkout-form-container">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm clientSecret={clientSecret} couponCode={appliedCoupon?.code} />
                                    </Elements>
                                </div>
                            )}
                        </div>

                        {/* Support Props */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">Express Fulfillment</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Logistics Network</p>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">Guaranteed Integrity</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">30-Day Restitution Protocol</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-16">
                        <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-6 md:p-10 border-b border-slate-50">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-6 md:mb-8">Order Hierarchy</h3>
                                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                                    {Array.isArray(cart.items) && cart.items.map((item: any) => (
                                        <div key={item.product?._id || Math.random()} className="flex gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                                                <img
                                                    src={Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : 'https://via.placeholder.com/100x100?text=No+Image'}
                                                    alt={item.product?.title || "Product"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-black text-slate-900 text-sm truncate">{item.product?.title || "Unknown Product"}</h4>
                                                <p className="text-xs text-slate-400 font-bold">Qty: {item.quantity || 1}</p>
                                            </div>
                                            <p className="font-black text-slate-900 text-sm">${(((item.product?.salePrice || item.product?.price) || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 md:p-10 bg-slate-50/50 space-y-6 md:space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-2">Promotion Protocol</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="ENTER CODE"
                                            disabled={!!appliedCoupon || applyingCoupon}
                                            className="flex-grow bg-white border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm shadow-sm min-w-0"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={applyingCoupon || !!appliedCoupon || !couponCode.trim()}
                                            className={`px-4 md:px-8 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 whitespace-nowrap ${appliedCoupon
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-900 text-white hover:bg-brand-600'
                                                }`}
                                        >
                                            {applyingCoupon ? <Loader2 className="animate-spin" size={16} /> : appliedCoupon ? 'Locked ✓' : 'Link'}
                                        </button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-[9px] md:text-[10px] font-black pl-2 tracking-tight uppercase">{couponError}</p>}
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center bg-green-100 border border-green-200 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <div>
                                                <p className="text-green-800 font-black text-[10px] md:text-xs uppercase tracking-widest">Code Applied</p>
                                                <p className="text-green-700/80 text-[9px] md:text-[10px] font-bold">-{appliedCoupon.value}% Optimization</p>
                                            </div>
                                            <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-green-900/50 hover:text-red-500 transition-colors font-black text-[9px] md:text-[10px] uppercase">Reset</button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Subtotal Configuration</span>
                                        <span>${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Global Fulfillment</span>
                                        <span className="text-green-600 uppercase tracking-widest text-[10px] font-black">Free Optimization</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-green-600 font-black text-sm">
                                            <span>Algorithmic Discount</span>
                                            <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                                        <div>
                                            <p className="text-slate-900 font-black text-base md:text-lg tracking-tight">Order Total</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inclusive of all duties</p>
                                        </div>
                                        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">${(appliedCoupon ? appliedCoupon.newTotal : cart.totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 bg-white space-y-4 md:space-y-6">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <Zap size={14} className="md:w-4 md:h-4" fill="currentColor" />
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Instant confirmation via digital node</p>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 text-pretty">
                                    <Info size={14} className="md:w-4 md:h-4 shrink-0" />
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">By completing procurement, you accept our standard neural architecture protocols.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
