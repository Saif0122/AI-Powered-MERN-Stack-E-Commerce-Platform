import React, { useEffect, useState } from 'react';
import { Ticket, Plus, X, Calendar } from 'lucide-react';
import api from '../../../services/api';

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiryDate: string;
    isActive: boolean;
    usageLimit?: number;
    usageCount: number;
}

const CouponManagement: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expiryDate: '',
        usageLimit: 100
    });

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/coupons');
            setCoupons(response.data.data.coupons);
        } catch (err) {
            console.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/coupons', newCoupon);
            setIsAdding(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                expiryDate: '',
                usageLimit: 100
            });
            fetchCoupons();
        } catch (err) {
            alert('Failed to create coupon');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/coupons/${id}`, { isActive: !currentStatus });
            fetchCoupons();
        } catch (err) {
            console.error('Failed to update coupon status');
        }
    };

    if (loading) return (
        <div className="p-20 text-center animate-pulse">
            <h2 className="text-slate-400 font-black uppercase tracking-widest">Scanning_Promotional_Nodes...</h2>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">PROMOTIONAL_ENGINE_LOCK</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                    {isAdding ? 'ABORT_CREATE' : 'NEW_PROMO_CODE'}
                </button>
            </div>

            {isAdding && (
                <div className="card p-8 bg-white border-2 border-slate-900 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code_Label</label>
                            <input
                                type="text"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand-500"
                                placeholder="SUMMER2026"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type_Protocol</label>
                            <select
                                value={newCoupon.discountType}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none"
                            >
                                <option value="percentage">PERCENTAGE (%)</option>
                                <option value="fixed">FIXED ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value_Magnitude</label>
                            <input
                                type="number"
                                value={newCoupon.discountValue}
                                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry_Timestamp</label>
                            <input
                                type="date"
                                value={newCoupon.expiryDate}
                                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-brand-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                        >
                            INIT_DEPLOY
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PROMO_ENTITY</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">VALUE</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">USAGE_LOAD</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">EXPIRY</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">PROTOCOL_GATE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {coupons.map(coupon => (
                            <tr key={coupon._id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                            <Ticket size={20} />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-lg tracking-tighter">{coupon.code}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID_{coupon._id.substring(coupon._id.length - 8).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <span className="font-black text-slate-900 text-xl tracking-tighter">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-brand-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min((coupon.usageCount / (coupon.usageLimit || 100)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <Calendar size={14} />
                                        <span className="text-xs font-bold">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <button
                                        onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${coupon.isActive
                                            ? 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white'
                                            : 'bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'
                                            }`}
                                    >
                                        {coupon.isActive ? 'ACTIVE_OK' : 'DENY_ACCESS'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CouponManagement;
