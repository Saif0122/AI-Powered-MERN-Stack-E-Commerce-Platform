import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithKind } from '../../services/axiosWrapper';
import type { AuthResponse } from '../../types';

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const name = `${firstName} ${lastName}`.trim();
            const response = await fetchWithKind<AuthResponse>('/auth/signup', {
                method: 'POST',
                data: { name, email, password, accountType },
            });
            // ... (rest of the handle submit logic unchanged)

            if (response.ok && response.data?.success) {
                console.log('[Auth] Signup Token received:', !!response.data.token);
                login(response.data);
                console.log('[Auth] Token stored in localStorage:', !!localStorage.getItem('token'));
                navigate('/');
            } else {
                setError(response.error?.message || 'Signup failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-center font-medium">
                    {error}
                </div>
            )}
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-sm md:text-base text-slate-500">Join the AI-powered marketplace today.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Jane"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Account Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setAccountType('buyer')}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${accountType === 'buyer' ? 'border-brand-600 bg-brand-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <div className="text-2xl mb-1">🛍️</div>
                            <div className="font-black text-slate-900 uppercase text-xs">Buyer</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Personal Shopping</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('seller')}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${accountType === 'seller' ? 'border-brand-600 bg-brand-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <div className="text-2xl mb-1">🏪</div>
                            <div className="font-black text-slate-900 uppercase text-xs">Seller</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sell Products</div>
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-full py-3 text-lg" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-slate-500">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-brand-600 font-bold hover:underline">Log in</Link>
            </p>
        </div>
    );
};

export default SignupPage;
