import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import { ShoppingBag, LogIn, Trash2, Plus, Minus, ShieldCheck, Truck, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
import SEO from '../components/common/SEO';
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
        <div className="bg-white min-h-screen pb-20 md:pb-32">
            <SEO title="Secure Cart | MercatoX AI" description="Review your selected assets before final procurement. Authorized session active." />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 md:pt-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-widest text-[10px] mb-3">
                            <ShieldCheck size={16} /> Secure Procurement
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">Order Manifest</h1>
                        <p className="text-slate-500 mt-4 text-base md:text-lg font-medium italic">Authorized procurement session for current active operator.</p>
                    </div>
                    <Link to="/shop" className="text-slate-900 font-black flex items-center gap-2 hover:text-brand-600 transition-colors text-sm md:text-base">
                        <ArrowLeft size={20} /> Continue Acquisition
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        {cart?.items.map((item) => (
                            <div key={item.product._id} className="group bg-white border border-slate-100 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[3rem] -z-0"></div>

                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 relative z-10">
                                    <div className="w-full sm:w-32 md:w-40 aspect-square bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 flex-shrink-0">
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="flex-grow text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight group-hover:text-brand-600 transition-colors uppercase leading-none mb-2">
                                                    {item.product.title}
                                                </h3>
                                                <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Tag size={12} /> {typeof item.product.category !== 'string' ? item.product.category?.name : 'Classified'}
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-right">
                                                <p className="text-2xl md:text-3xl font-black text-slate-950 leading-none mb-1">
                                                    ${item.product.salePrice || item.product.price}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unit Credit</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                                            <div className="flex items-center bg-slate-50 rounded-[1rem] p-1.5 border border-slate-100">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-[0.8rem] text-slate-400 hover:text-brand-600 hover:shadow-lg transition-all"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 md:w-14 text-center font-black text-slate-900 text-base md:text-lg">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-[0.8rem] text-slate-400 hover:text-brand-600 hover:shadow-lg transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.product._id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group/del"
                                            >
                                                <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                                                Neutralize Asset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 mt-8 lg:mt-0">
                        <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600 opacity-10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                            <h2 className="text-3xl font-black tracking-tighter mb-8 md:mb-10 flex items-center gap-3">
                                Financials
                                <div className="flex-grow h-px bg-white/10"></div>
                            </h2>

                            <div className="space-y-5 md:space-y-6 mb-10 md:mb-12">
                                <div className="flex justify-between items-center text-sm md:text-base">
                                    <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">Subtotal Manifest</span>
                                    <span className="font-bold">${cart?.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm md:text-base">
                                    <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">Logistics Units</span>
                                    <span className="text-brand-400 font-bold">CALCULATED AT NEXT STAGE</span>
                                </div>
                                <div className="h-px bg-white/10 w-full"></div>
                                <div className="flex justify-between items-end pt-2">
                                    <div>
                                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Total Credit Required</p>
                                        <p className="text-4xl md:text-5xl font-black text-brand-400 tracking-tighter">${total.toFixed(2)}</p>
                                    </div>
                                    <ShieldCheck size={32} className="text-white/10 mb-2" />
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] text-lg md:text-xl font-black transition-all transform hover:scale-[1.02] shadow-xl shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                Secure Checkout
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
