import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import couponService from '../services/couponService';
import type { Coupon } from '../types';

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
                setError(err.response?.data?.message || 'Failed to initialize payment');
            } finally {
                setLoading(false);
            }
        };

        if (cart && cart.items.length > 0) {
            fetchIntent();
        } else if (cart && cart.items.length === 0) {
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
            setCouponError(err.response?.data?.message || 'Invalid coupon');
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    if (loading) return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center animate-pulse">
            <h2 className="text-3xl font-black mb-8">Initializing AI Secure Checkout...</h2>
            <div className="h-64 bg-slate-50 rounded-[40px]"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-red-500 font-bold">
            <h2 className="text-3xl font-black mb-4">Error</h2>
            <p>{error}</p>
        </div>
    );

    if (!cart || cart.items.length === 0) return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
            <p className="text-slate-500">Go add some products before checking out!</p>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-slate-900 mb-2">Checkout</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI Secure Payment Gateway</p>
                <div className="mt-6 space-y-2">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-slate-400 text-sm font-medium">Subtotal: ${cart.totalPrice.toFixed(2)}</span>
                        {appliedCoupon && (
                            <span className="text-green-600 font-black flex items-center gap-1">
                                ✨ Discount: -${appliedCoupon.discountAmount.toFixed(2)}
                            </span>
                        )}
                        <div className="inline-flex items-center gap-2 bg-brand-50 px-6 py-2 rounded-full text-brand-600 font-black text-xl shadow-inner border border-brand-100/50">
                            Total: ${appliedCoupon ? appliedCoupon.newTotal.toFixed(2) : cart.totalPrice.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-white border border-slate-200 p-6 mb-8 shadow-xl">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    Have a promo code?
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="ENTER CODE"
                        disabled={!!appliedCoupon || applyingCoupon}
                        className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !!appliedCoupon || !couponCode.trim()}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${appliedCoupon
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                            }`}
                    >
                        {applyingCoupon ? '...' : appliedCoupon ? 'Applied ✓' : 'Apply'}
                    </button>
                </div>
                {couponError && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-tight">{couponError}</p>}
                {appliedCoupon && (
                    <div className="mt-3 flex justify-between items-center bg-green-50/50 p-2 rounded-lg border border-green-100">
                        <span className="text-green-800 text-[10px] font-black uppercase tracking-widest">Code Applied Successfully</span>
                        <button
                            onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                            className="text-slate-400 hover:text-red-500 font-bold text-[10px]"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} couponCode={appliedCoupon?.code} />
                </Elements>
            )}
        </div>
    );
};

export default CheckoutPage;
