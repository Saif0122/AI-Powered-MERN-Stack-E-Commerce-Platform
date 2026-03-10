import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, Heart, ChevronDown, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-2' : 'bg-white border-b border-slate-200 py-4'
                }`}>
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl">M</div>
                        <span>Mercato<span className="text-brand-600 text-base sm:text-lg">X</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        <Link to="/" className="px-4 py-2 font-bold text-slate-600 hover:text-brand-600 rounded-xl transition-colors">Home</Link>
                        <Link to="/shop" className="px-4 py-2 font-bold text-slate-600 hover:text-brand-600 rounded-xl transition-colors">Shop</Link>
                        <Link to="/recommendations" className="px-4 py-2 font-bold text-slate-600 hover:text-brand-600 rounded-xl transition-colors">AI Search</Link>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-md relative group">
                        <input
                            type="text"
                            placeholder="Search premium products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-5 pr-12 focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 placeholder:text-slate-400 group-hover:bg-slate-200 transition-all"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600">
                            <Search size={20} strokeWidth={2.5} />
                        </button>
                    </form>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <Link to="/wishlist" className="p-2 sm:p-2.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-2xl transition-all relative">
                            <Heart size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.2} />
                        </Link>
                        <Link to="/cart" className="p-2 sm:p-2.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-2xl transition-all relative">
                            <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.2} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-brand-600 text-white text-[9px] sm:text-[10px] font-black h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-6 w-px bg-slate-200 mx-1 sm:mx-2 hidden lg:block"></div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 pr-2 sm:pr-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black text-[12px] sm:text-sm uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-700 hidden sm:block">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={12} className={`text-slate-400 group-hover:text-brand-600 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-50 py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="px-6 py-4 border-b border-slate-50 mb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:bg-brand-50 hover:text-brand-600 font-bold transition-all"
                                            >
                                                <LayoutDashboard size={18} /> Dashboard
                                            </Link>
                                            <div className="h-px bg-slate-50 my-2 mx-6"></div>
                                            <button
                                                onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 font-bold transition-all"
                                            >
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth/login" className="bg-slate-900 hover:bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-slate-600 bg-slate-50 rounded-xl"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top pb-6">
                        <div className="px-6 pt-6 flex flex-col space-y-2">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all">Home</Link>
                            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all">Shop</Link>
                            <Link to="/recommendations" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 font-bold text-slate-600 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all">AI Search</Link>
                            <div className="h-px bg-slate-100 my-4"></div>
                            <form onSubmit={handleSearch} className="relative group mx-4">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-5 pr-12 text-slate-900 placeholder:text-slate-400"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-slate-900 text-slate-300 pt-16 md:pt-24 pb-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 mb-20">
                        {/* Brand Column */}
                        <div className="col-span-1">
                            <Link to="/" className="text-2xl font-black text-white mb-6 md:mb-8 block tracking-tighter">
                                <span className="text-brand-600">M</span>ercatoX
                            </Link>
                            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed font-medium text-sm md:text-base">
                                The ultimate AI-powered shopping ecosystem. Premium curation meets intelligent discovery.
                            </p>
                            <div className="flex space-x-5">
                                {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                                    <span key={social} className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all cursor-pointer group">
                                        <span className="sr-only">{social}</span>
                                        <div className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{social[0]}</div>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Navigation</h4>
                            <ul className="space-y-4">
                                <li><Link to="/shop" className="hover:text-brand-400 hover:translate-x-1 inline-block transition-all font-medium">Shop Catalog</Link></li>
                                <li><Link to="/recommendations" className="hover:text-brand-400 hover:translate-x-1 inline-block transition-all font-medium">AI Smart Search</Link></li>
                                <li><Link to="/wishlist" className="hover:text-brand-400 hover:translate-x-1 inline-block transition-all font-medium">Saved Items</Link></li>
                                <li><Link to="/dashboard" className="hover:text-brand-400 hover:translate-x-1 inline-block transition-all font-medium">Customer Dashboard</Link></li>
                            </ul>
                        </div>

                        {/* Store Policies */}
                        <div>
                            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Assistance</h4>
                            <ul className="space-y-4">
                                <li><span className="hover:text-brand-400 transition-all cursor-pointer font-medium">Shipment Tracking</span></li>
                                <li><span className="hover:text-brand-400 transition-all cursor-pointer font-medium">Refund Policy</span></li>
                                <li><span className="hover:text-brand-400 transition-all cursor-pointer font-medium">Secure Payments</span></li>
                                <li><span className="hover:text-brand-400 transition-all cursor-pointer font-medium">Vendor Program</span></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem]">
                            <h4 className="text-white font-black mb-6 uppercase tracking-[0.2em] text-xs">Direct Support</h4>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4 text-xs sm:text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center flex-shrink-0">@</div>
                                    <span className="leading-tight pt-1 truncate">support@mercatox.tech</span>
                                </li>
                                <li className="flex items-start gap-4 text-xs sm:text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-green-600/20 text-green-400 flex items-center justify-center flex-shrink-0">P</div>
                                    <span className="leading-tight pt-1">+1 (888) AI-SHOP-NOW</span>
                                </li>
                            </ul>
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">System Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs text-white font-bold italic">All Nodes Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center bg-transparent">
                        <div className="mb-8 md:mb-0 text-center md:text-left">
                            <p className="text-brand-500 text-xs font-black uppercase tracking-widest mb-2 italic">
                                MercatoX Digital Defense Active
                            </p>
                            <p className="text-slate-200 text-sm font-black">
                                © 2026 MercatoX AI E-Commerce Platform. All Rights Reserved.
                            </p>
                            <p className="text-slate-600 text-[10px] mt-2 max-w-lg mx-auto md:mx-0">
                                Protected Proprietary Technology. Any unauthorized extraction of data or reproduction of assets is subject to international copyright law.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <div className="flex space-x-8 text-xs font-bold text-slate-500">
                                <span className="hover:text-white cursor-pointer transition-all">Privacy</span>
                                <span className="hover:text-white cursor-pointer transition-all">Licensing</span>
                                <span className="hover:text-white cursor-pointer transition-all">Security</span>
                            </div>
                            <div className="px-3 py-1 bg-brand-600/10 border border-brand-600/20 rounded-full">
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">
                                    Premium Portfolio Project v3.0
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
