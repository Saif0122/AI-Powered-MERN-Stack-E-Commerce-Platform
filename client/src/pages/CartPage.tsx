import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import { ShoppingBag, LogIn, Trash2, Plus, Minus, ShieldCheck, Truck, ArrowRight, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
    const { cart, loading, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();

    if (!user) {
        return (
            <EmptyState
                icon={LogIn}
                title="Authorization Required"
                description="Secure your session to manage your specialized procurement list. Access premium features by authenticating your account."
                actionText="System Authentication"
                actionLink="/auth/login"
            />
        );
    }

    if (loading && !cart) {
        return (
            <div className="max-w-7xl mx-auto px-8 py-32 text-center">
                <div className="relative inline-block w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-brand-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                        <ShoppingBag size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 animate-pulse">Synchronizing Cart Data...</h2>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <EmptyState
                icon={ShoppingBag}
                title="Order List Undetected"
                description="Your specialized procurement list is currently void. Initialize a new session by exploring our high-level catalog."
                actionText="Explore Catalog"
                actionLink="/shop"
            />
        );
    }

    const subtotal = cart.totalPrice;
    const shipping = subtotal > 500 ? 0 : 25;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleRemove = async (productId: string) => {
        try {
            await removeFromCart(productId);
            toast.success('Item removed from inventory', {
                icon: '🗑️',
                style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' }
            });
        } catch (err) {
            toast.error('Logistics error: Could not remove item');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            <div className="max-w-7xl mx-auto px-8 pt-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-[10px] mb-4">
                            <ShoppingCart size={14} fill="currentColor" /> Logic Fulfillment
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Procurement <br />List</h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Batch</p>
                            <p className="font-black text-slate-900">{cart.items.length} High-Value Items</p>
                        </div>
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        {cart.items.map((item) => (
                            <div key={item.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-brand-600/20 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>

                                <Link to={`/shop/product/${item.product._id}`} className="w-40 h-40 bg-slate-50 rounded-[2rem] overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-slate-100 group-hover:bg-white group-hover:scale-105 transition-all">
                                    {item.product.images?.length > 0 ? (
                                        <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <span className="text-4xl">📦</span>
                                    )}
                                </Link>

                                <div className="flex-grow space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Premium Asset</span>
                                            {item.product.stock < 10 && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">Critical Stock</span>}
                                        </div>
                                        <Link to={`/shop/product/${item.product._id}`} className="text-2xl font-black text-slate-950 hover:text-brand-600 transition-colors leading-none tracking-tight">
                                            {item.product.title}
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || loading}
                                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-900 hover:bg-brand-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
                                            >
                                                <Minus size={16} strokeWidth={3} />
                                            </button>
                                            <span className="w-12 text-center font-black text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                disabled={loading}
                                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-900 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemove(item.product._id)}
                                            className="flex items-center gap-2 text-slate-300 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all hover:gap-3"
                                        >
                                            <Trash2 size={16} /> Purge Item
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right md:w-40 flex-shrink-0">
                                    <p className="text-3xl font-black text-slate-950 tracking-tight">${(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Unit: ${item.priceAtPurchase}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-950 rounded-[3rem] p-10 text-white sticky top-24 shadow-2xl shadow-slate-900/30 overflow-hidden relative">
                            {/* Visual Polish */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 blur-[100px] rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/5 blur-[80px] rounded-full"></div>

                            <h3 className="text-3xl font-black mb-10 tracking-tighter flex items-center gap-3">
                                <ShieldCheck size={28} className="text-brand-500" /> Procurement Ledger
                            </h3>

                            <div className="space-y-6 mb-12">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">Cumulative Subtotal</span>
                                    <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">Logistics Fee</span>
                                    <span className={`text-xl font-bold ${shipping === 0 ? 'text-green-400' : ''}`}>
                                        {shipping === 0 ? 'Waiver Active' : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">System Tax (8%)</span>
                                    <span className="text-xl font-bold">${tax.toFixed(2)}</span>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-1">Total Valuation</p>
                                        <p className="text-5xl font-black tracking-tighter">${total.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-brand-600/20 text-brand-400 px-3 py-1.5 rounded-xl border border-brand-600/30 text-[10px] font-black uppercase tracking-tighter">
                                        Verified
                                    </div>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="group relative w-full bg-brand-600 hover:bg-brand-700 text-white py-6 rounded-3xl text-xl font-black shadow-xl shadow-brand-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <span className="relative z-10">Authorize Checkout</span>
                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </Link>

                            <div className="mt-10 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                                    <Truck size={20} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                    {shipping === 0
                                        ? 'Express Priority Logistics Protocol active for high-valuation orders.'
                                        : 'Append $250+ more assets to activate logistics waiver protocol.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
