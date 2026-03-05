import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

interface CheckoutFormProps {
    clientSecret: string;
    couponCode?: string;
}

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
                setError(result.error.message || 'Payment failed');
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
            setError('An unexpected error occurred.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card bg-slate-50 p-6 border border-slate-200">
                <div className="mb-4">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-2 block">
                        Card Details
                    </label>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#0f172a',
                                    '::placeholder': { color: '#94a3b8' },
                                },
                                invalid: { color: '#ef4444' },
                            },
                        }} />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 font-bold bg-red-50 p-4 rounded-xl text-sm">{error}</p>}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="btn btn-primary w-full py-5 text-xl font-black shadow-2xl shadow-brand-100 uppercase tracking-widest"
            >
                {loading ? 'Processing...' : 'Pay with AI Secure'}
            </button>
            <p className="text-center text-slate-400 text-sm font-medium">✨ Powered by Stripe Test Mode</p>
        </form>
    );
};

export default CheckoutForm;
