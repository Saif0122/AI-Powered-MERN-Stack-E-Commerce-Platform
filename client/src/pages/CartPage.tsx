import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
    const { cart, loading, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-black mb-4">Please log in</h2>
                <p className="text-slate-500 mb-8">You need to be logged in to view your cart.</p>
                <Link to="/auth/login" className="btn btn-primary px-8 py-3">Log In</Link>
            </div>
        );
    }

    if (loading && !cart) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600 mb-4"></div>
                <p className="text-slate-500">Loading your cart...</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-6">🛒</div>
                <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
                <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="btn btn-primary px-8 py-3">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-black text-slate-900 mb-10">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map((item) => (
                        <div key={item.id} className="card bg-white p-6 flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl">
                                📦
                            </div>

                            <div className="flex-grow">
                                <Link to={`/shop/product/${item.product._id}`} className="text-xl font-bold hover:text-brand-600 transition-colors">
                                    {item.product.title}
                                </Link>
                                <p className="text-slate-500 text-sm line-clamp-1 mt-1">{item.product.description}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || loading}
                                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-1 font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            disabled={loading}
                                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product._id)}
                                        className="text-red-500 text-sm font-bold hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <p className="text-xl font-black text-slate-900">${(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                                <p className="text-slate-400 text-xs">${item.priceAtPurchase} each</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card bg-white p-8 sticky top-24">
                        <h3 className="text-2xl font-black mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Subtotal</span>
                                <span>${cart.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Shipping</span>
                                <span className="text-green-600 uppercase font-bold text-xs">Calculated at next step</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                <span className="text-xl font-bold">Total</span>
                                <span className="text-3xl font-black text-brand-600">${cart.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link to="/checkout" className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-brand-500/20 text-center block">
                            Proceed to Checkout
                        </Link>
                        <p className="text-center text-slate-400 text-xs mt-4">
                            Secure payments powered by MercatoX
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
