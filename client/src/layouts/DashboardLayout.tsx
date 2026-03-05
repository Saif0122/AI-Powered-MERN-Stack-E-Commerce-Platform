import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { label: 'Overview', path: '/dashboard', icon: '📊' },
        { label: 'My Orders', path: '/dashboard/orders', icon: '📦' },
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    if (user?.role === 'seller') {
        menuItems.push({ label: 'Seller Hub', path: '/dashboard', icon: '🏪' });
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0">
                <div className="p-6">
                    <Link to="/" className="text-2xl font-bold">MercatoX</Link>
                </div>

                <nav className="flex-grow px-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-brand-600 text-white'
                                : 'hover:bg-slate-800 text-slate-400'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 px-4">
                        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold">
                            {user?.name?.[0]}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-grow">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Dashboard</h2>
                    <div className="flex space-x-4">
                        <button className="text-slate-400 hover:text-slate-600">🔔</button>
                        <Link to="/" className="text-sm text-brand-600 font-medium">Back to Shop</Link>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
