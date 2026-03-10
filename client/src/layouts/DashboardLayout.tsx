import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Box,
    Settings,
    Store,
    ChevronLeft,
    Bell,
    LogOut,
    HelpCircle,
    ShoppingBag,
    Truck,
    ShieldCheck,
    X,
    Menu
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { label: 'My Orders', path: '/dashboard/orders', icon: <Box size={20} /> },
        { label: 'Logistics', path: '/dashboard/shipping', icon: <Truck size={20} /> },
        { label: 'Account', path: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    if (user?.role === 'seller') {
        menuItems.splice(1, 0, { label: 'Merchant Hub', path: '/dashboard', icon: <Store size={20} /> });
    }

    if (user?.role === 'admin') {
        menuItems.push({ label: 'Admin Terminal', path: '/admindashboard', icon: <ShieldCheck size={20} /> });
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-8 flex items-center justify-between relative z-10">
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 md:gap-3 group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={16} className="md:w-5 md:h-5" fill="white" />
                        </div>
                        <span>Mercato<span className="text-brand-500">X</span></span>
                    </Link>
                )}
                {!isMobileMenuOpen && (
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all ${isSidebarCollapsed ? 'mx-auto' : ''}`}
                    >
                        <ChevronLeft size={20} className={`transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                )}
                {isMobileMenuOpen && (
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-grow px-4 mt-8 space-y-2 relative z-10">
                <p className={`px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ${(isSidebarCollapsed && !isMobileMenuOpen) ? 'text-center' : ''}`}>
                    {(isSidebarCollapsed && !isMobileMenuOpen) ? '...' : 'Management Stack'}
                </p>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative overflow-hidden ${location.pathname === item.path
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                            : 'hover:bg-slate-900 text-slate-400 hover:text-slate-100'
                            }`}
                    >
                        {location.pathname === item.path && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                        )}
                        <span className={`${location.pathname === item.path ? 'text-white' : 'group-hover:text-brand-400'} transition-colors ${(isSidebarCollapsed && !isMobileMenuOpen) ? 'mx-auto' : ''}`}>
                            {item.icon}
                        </span>
                        {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-sm tracking-tight">{item.label}</span>}

                        {location.pathname === item.path && !isSidebarCollapsed && !isMobileMenuOpen && (
                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-6 mt-auto border-t border-slate-900 relative z-10">
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <div className="bg-slate-900/50 rounded-3xl p-4 mb-6 border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-black text-lg shadow-lg">
                                {user?.name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate">{user?.name}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user?.role} Access</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-100 hover:bg-slate-900 transition-all ${(isSidebarCollapsed && !isMobileMenuOpen) ? 'justify-center' : ''}`}>
                        <HelpCircle size={20} />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-xs uppercase tracking-widest">Support</span>}
                    </button>
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all ${(isSidebarCollapsed && !isMobileMenuOpen) ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} />
                        {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 ${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-slate-950 text-white transition-all duration-500 ease-in-out z-50 shadow-2xl overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-64 bg-brand-600 blur-[100px] -translate-y-1/2"></div>
                </div>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 text-white z-[60] lg:hidden transform transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-64 bg-brand-600 blur-[100px] -translate-y-1/2"></div>
                </div>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className={`flex-grow transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-24' : 'lg:ml-72'} w-full`}>
                <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center px-4 sm:px-8 lg:px-12 justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight leading-none">
                                {menuItems.find(i => i.path === location.pathname)?.label || 'Console'}
                            </h2>
                            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                <span className="hidden sm:inline">MercatoX</span>
                                <span className="hidden sm:inline w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-brand-600">Active Node</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="relative p-2.5 sm:p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-brand-600 hover:bg-white border border-slate-100 transition-all shadow-sm">
                            <Bell size={18} className="sm:w-5 sm:h-5" />
                            <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-600 border-2 border-slate-50 rounded-full"></span>
                        </button>
                        <Link to="/" className="hidden sm:flex bg-slate-950 text-white px-4 lg:px-8 py-3 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-brand-600 hover:scale-105 transition-all shadow-xl shadow-slate-200">
                            Marketplace Terminal
                        </Link>
                    </div>
                </header>

                <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
