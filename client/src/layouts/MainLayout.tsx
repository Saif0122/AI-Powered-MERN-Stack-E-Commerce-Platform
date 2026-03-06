import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();

    const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    // React.useEffect(() => {
    //     const handleContextMenu = (e: MouseEvent) => {
    //         e.preventDefault();
    //         alert("This website content is protected by copyright.");
    //     };

    //     const handleKeyDown = (e: KeyboardEvent) => {
    //         // Block Ctrl+U, Ctrl+C, Ctrl+S, Ctrl+Shift+I, F12
    //         if (
    //             (e.ctrlKey && (e.key === 'u' || e.key === 'c' || e.key === 's')) ||
    //             (e.ctrlKey && e.shiftKey && e.key === 'I') ||
    //             e.key === 'F12'
    //         ) {
    //             e.preventDefault();
    //             alert("This website content is protected by copyright.");
    //         }
    //     };

    //     window.addEventListener('contextmenu', handleContextMenu);
    //     window.addEventListener('keydown', handleKeyDown);

    //     return () => {
    //         window.removeEventListener('contextmenu', handleContextMenu);
    //         window.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, []);


    React.useEffect(() => {
        if (process.env.NODE_ENV === "development") return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            alert("This website content is protected by copyright.");
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && (e.key === 'u' || e.key === 'c' || e.key === 's')) ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                alert("This website content is protected by copyright.");
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">
                        MercatoX
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/shop" className="nav-link">Shop</Link>
                        <Link to="/recommendations" className="nav-link">AI Search</Link>
                        <Link to="/wishlist" className="nav-link">Wishlist</Link>
                        <Link to="/cart" className="relative nav-link flex items-center">
                            Cart
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-3 bg-brand-600 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="btn bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm py-1.5 grayscale-0">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth/login" className="btn btn-primary text-sm py-1.5 px-6">
                                Login
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="col-span-1">
                            <Link to="/" className="text-2xl font-black text-white mb-6 block">
                                MercatoX
                            </Link>
                            <p className="text-slate-400 mb-6 leading-relaxed">
                                The next generation of e-commerce, driven by intelligent search and personalized experiences.
                            </p>
                            <div className="flex space-x-4">
                                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                                    <span key={social} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all cursor-pointer">
                                        <span className="sr-only">{social}</span>
                                        {social[0]}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                            <ul className="space-y-4">
                                <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Shop All</Link></li>
                                <li><Link to="/recommendations" className="hover:text-brand-400 transition-colors">AI Search</Link></li>
                                <li><Link to="/wishlist" className="hover:text-brand-400 transition-colors">Wishlist</Link></li>
                                <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">My Account</Link></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Top Categories</h4>
                            <ul className="space-y-4">
                                <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Electronics</Link></li>
                                <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Clothing</Link></li>
                                <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Home & Garden</Link></li>
                                <li><Link to="/shop" className="hover:text-brand-400 transition-colors">Beauty & Health</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <span className="text-brand-400 font-bold">A:</span>
                                    <span>123 Commerce St, Digital Valley, CA</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-brand-400 font-bold">E:</span>
                                    <span>support@mercatox.com</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-brand-400 font-bold">P:</span>
                                    <span>+1 (555) 123-4567</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center bg-slate-900">
                        <div className="mb-4 md:mb-0">
                            <p className="text-slate-200 text-sm font-black mb-1">
                                © 2026 MercatoX. All Rights Reserved.
                            </p>
                            <p className="text-slate-500 text-[10px] leading-tight max-w-md">
                                Unauthorized copying, modification, distribution, or commercial use of this website or its code is strictly prohibited. Protected Intellectual Property – Unauthorized use prohibited
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex space-x-6 text-sm text-slate-500">
                                <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
                                <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
                                <span className="hover:text-slate-300 cursor-pointer">Cookies</span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-500/50 uppercase tracking-widest">
                                Protected by MercatoX Sentinel
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
