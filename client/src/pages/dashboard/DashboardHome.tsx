import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SellerDashboard from './SellerDashboard';

const DashboardHome: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === 'seller') {
        return <SellerDashboard />;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center space-y-8">
                <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                    👋
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Welcome back, <span className="text-brand-600">{user?.name}</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
                        This is your personal Buyer Dashboard. From here you can manage your orders, shipping addresses, and account settings.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all text-left">
                        <div className="font-black text-slate-900 mb-1 tracking-tight uppercase text-xs">Orders</div>
                        <p className="text-slate-500 text-sm">View and track your recent purchases</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all text-left">
                        <div className="font-black text-slate-900 mb-1 tracking-tight uppercase text-xs">Settings</div>
                        <p className="text-slate-500 text-sm">Update your profile and preferences</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
