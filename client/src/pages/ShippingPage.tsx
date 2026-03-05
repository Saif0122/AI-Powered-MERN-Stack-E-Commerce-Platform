import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { ShippingAddress } from '../types';

const ShippingPage: React.FC = () => {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        isDefault: false
    });
    const [error, setError] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/shipping');
            setAddresses(response.data.data.addresses);
        } catch (err: any) {
            console.error('Error fetching addresses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingId) {
                await api.put(`/shipping/${editingId}`, formData);
            } else {
                await api.post('/shipping', formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                fullName: '',
                phone: '',
                address: '',
                city: '',
                postalCode: '',
                country: '',
                isDefault: false
            });
            fetchAddresses();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save address');
        }
    };

    const handleEdit = (addr: ShippingAddress) => {
        setFormData({
            fullName: addr.fullName,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
            isDefault: addr.isDefault
        });
        setEditingId(addr.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/shipping/${id}`);
            fetchAddresses();
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await api.patch(`/shipping/${id}/default`);
            fetchAddresses();
        } catch (err) {
            alert('Failed to set default address');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-slate-900">Shipping Addresses</h1>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                    className="btn btn-primary px-6 py-2 shadow-lg shadow-brand-200"
                >
                    {showForm ? 'Cancel' : 'Add New Address'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card bg-white p-8 mb-12 shadow-xl border border-slate-100">
                    <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Address' : 'New Address'}</h2>
                    {error && <p className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 font-medium">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Full Name</label>
                            <input
                                type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Phone Number</label>
                            <input
                                type="text" name="phone" value={formData.phone} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Street Address</label>
                            <input
                                type="text" name="address" value={formData.address} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">City</label>
                            <input
                                type="text" name="city" value={formData.city} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Postal Code</label>
                            <input
                                type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-tight">Country</label>
                            <input
                                type="text" name="country" value={formData.country} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3 py-2">
                            <input
                                type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <label className="text-slate-700 font-medium">Set as default shipping address</label>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button type="submit" className="btn btn-primary px-10 py-3 font-bold">
                            {editingId ? 'Update Address' : 'Save Address'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-slate-100">
                    <span className="text-6xl mb-6 block">📍</span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No addresses saved</h3>
                    <p className="text-slate-500">Add a shipping address to speed up your checkout process.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {addresses.map(addr => (
                        <div key={addr.id} className={`card p-8 border-2 transition-all ${addr.isDefault ? 'border-brand-600 bg-brand-50/10' : 'border-slate-100 bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-black text-slate-900">{addr.fullName}</h3>
                                        {addr.isDefault && (
                                            <span className="bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 font-medium">{addr.phone}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleEdit(addr)} className="text-slate-400 hover:text-brand-600 font-bold text-sm">Edit</button>
                                    <button onClick={() => handleDelete(addr.id)} className="text-slate-400 hover:text-red-500 font-bold text-sm">Delete</button>
                                </div>
                            </div>
                            <div className="text-slate-600 space-y-1">
                                <p className="text-lg">{addr.address}</p>
                                <p className="font-medium">{addr.city}, {addr.postalCode}</p>
                                <p className="font-bold uppercase tracking-widest text-xs text-slate-400">{addr.country}</p>
                            </div>
                            {!addr.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="mt-6 text-brand-600 font-black text-sm uppercase tracking-tighter hover:underline"
                                >
                                    Set as Default
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShippingPage;
