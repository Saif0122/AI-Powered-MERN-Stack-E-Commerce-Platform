import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SellerDashboard from './SellerDashboard';

const DashboardHome: React.FC = () => {
    const { user } = useAuth();

    if (user?.role === 'seller') {
        return <SellerDashboard />;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-[2rem] md:rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-100 text-center space-y-6 md:space-y-8">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto text-2xl md:text-4xl shadow-inner">
                    👋
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">
                        Welcome back, <br className="md:hidden" /> <span className="text-brand-600">{user?.name}</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        This is your personal Buyer Dashboard. From here you can manage your orders, shipping addresses, and account settings.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto pt-6 md:pt-8">
                    <div className="p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all text-left">
                        <div className="font-black text-slate-900 mb-1 tracking-tight uppercase text-[10px] md:text-xs">Orders</div>
                        <p className="text-slate-500 text-xs md:text-sm">View and track your recent purchases</p>
                    </div>
                    <div className="p-5 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all text-left">
                        <div className="font-black text-slate-900 mb-1 tracking-tight uppercase text-[10px] md:text-xs">Settings</div>
                        <p className="text-slate-500 text-xs md:text-sm">Update your profile and preferences</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
