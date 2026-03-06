import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

interface CheckoutFormProps {
    clientSecret: string;
    couponCode?: string;
}

import { ShieldCheck, Loader2, Lock } from 'lucide-react';

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, couponCode }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { fetchCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        try {
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                setError(result.error.message || 'Transaction authorization failed');
                setLoading(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // Create order in backend after payment
                    await api.post('/orders', { couponCode });
                    await fetchCart(); // Refresh cart to empty it
                    navigate('/dashboard/orders');
                }
            }
        } catch (err: any) {
            setError('Neural link synchronization failure. Please verify connectivity.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block pl-2">
                        Financial Instrument Details
                    </label>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner group focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '18px',
                                    color: '#0f172a',
                                    fontFamily: 'Outfit, sans-serif',
                                    fontWeight: '600',
                                    '::placeholder': { color: '#94a3b8' },
                                },
                                invalid: { color: '#ef4444' },
                            },
                        }} />
                    </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest leading-none">AI Secure Vault Active</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 flex-shrink-0 font-black">!</div>
                    <p className="text-red-600 text-sm font-bold mt-1.5">{error}</p>
                </div>
            )}

            <div className="space-y-6">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full bg-slate-900 hover:bg-brand-600 text-white rounded-[1.8rem] py-6 text-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <Lock size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                            Finalize Procurement
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                    <div className="w-px h-4 bg-slate-300"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Test Node Integrated</p>
                </div>
            </div>
        </form>
    );
};

export default CheckoutForm;
