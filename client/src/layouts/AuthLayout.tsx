import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            <div className="hidden lg:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="text-3xl font-bold mb-8 block">MercatoX</Link>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Elevate Your <br />
                        Shopping Experience.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-md">
                        The world's first AI-driven marketplace that truly understands your needs.
                    </p>
                </div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Link to="/" className="lg:hidden text-2xl font-bold text-slate-900 mb-8 block">MercatoX</Link>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
