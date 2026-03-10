import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithKind } from '../../services/axiosWrapper';
import type { AuthResponse } from '../../types';

const LoginPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(location.state?.message || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetchWithKind<AuthResponse>('/auth/login', {
                method: 'POST',
                data: { email, password },
            });

            if (response.ok && response.data?.success) {
                console.log('[Auth] Token received:', !!response.data.token);
                login(response.data);
                console.log('[Auth] Token stored in localStorage:', !!localStorage.getItem('token'));
                navigate('/');
            } else {
                setError(response.error?.message || 'Invalid email or password');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
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
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-sm md:text-base text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    <div className="flex justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700">Password</label>
                        <a href="#" className="text-sm text-brand-600 font-bold hover:underline">Forgot?</a>
                    </div>
                    <input
                        type="password"
                        className="input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-full py-3 text-lg" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-slate-500">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-brand-600 font-bold hover:underline">Sign up for free</Link>
            </p>
        </div>
    );
};

export default LoginPage;
