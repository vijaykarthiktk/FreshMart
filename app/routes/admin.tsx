import type { Route } from "./+types/admin";
import React, { useEffect, useMemo, useState } from 'react';
import { AuthGate, useUser, LogoutButton } from '../components/AuthGate';
import { apiFetch } from '../lib/api';

// Minimal inline charts using SVG for simplicity
function LineChart({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
    const width = 320, height = 120, pad = 24;
    const xs = data.map(d => new Date(d[xKey] || d.createdAt).getTime());
    const ys = data.map(d => Number(d[yKey]));
    if (xs.length === 0) return <svg width={width} height={height}></svg>;
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const scaleX = (t: number) => pad + (width - 2 * pad) * ((t - minX) / ((maxX - minX) || 1));
    const scaleY = (v: number) => height - pad - (height - 2 * pad) * ((v - minY) / ((maxY - minY) || 1));
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(x)} ${scaleY(ys[i])}`).join(' ');
    return (
        <svg width={width} height={height} className="border">
            <path d={path} stroke="#2563EB" fill="none" strokeWidth={2} />
        </svg>
    );
}

export function meta({ }: Route.MetaArgs) {
    return [{ title: 'Admin Dashboard - FreshMart' }];
}

export default function AdminPage() {
    return (
        <AuthGate>
            <AdminInner />
        </AuthGate>
    );
}

function AdminInner() {
    const { user } = useUser();
    const [me, setMe] = useState<{ isAdmin: boolean } | null>(null);

    useEffect(() => {
        apiFetch('/me').then(setMe as any).catch(() => setMe({ isAdmin: false } as any));
    }, []);

    if (!me) return <div className="p-4">Loading...</div>;
    if (!me.isAdmin) return <div className="p-4">Access denied. Not an admin. <LogoutButton /></div>;

    return <Dashboard />;
}

function Dashboard() {
    const [overview, setOverview] = useState<any>(null);
    const [ratings, setRatings] = useState<any[]>([]);

    const [broadcastTitle, setBroadcastTitle] = useState('Flash Sale');
    const [broadcastMsg, setBroadcastMsg] = useState('Bananas 15% off!');
    const [products, setProducts] = useState<any[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    useEffect(() => {
        apiFetch('/admin/analytics/overview').then(setOverview);
        apiFetch<any[]>('/admin/analytics/ratings').then(setRatings);
        apiFetch<any[]>('/products').then(setProducts);
    }, []);



    const handleBroadcast = async () => {
        await apiFetch('/notifications/broadcast', { method: 'POST', body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg }) });
        alert('Notification sent');
    };



    const handleAddProduct = async (product: any) => {
        try {
            await apiFetch('/products', { method: 'POST', body: JSON.stringify(product) });
            setProducts(await apiFetch<any[]>('/products'));
            setShowAddProduct(false);
            alert('Product added');
        } catch (e: any) {
            alert('Failed to add product: ' + e.message);
        }
    };

    const handleEditProduct = async (product: any) => {
        try {
            await apiFetch(`/products/${editingProduct._id}`, { method: 'PUT', body: JSON.stringify(product) });
            setProducts(await apiFetch<any[]>('/products'));
            setEditingProduct(null);
            alert('Product updated');
        } catch (e: any) {
            alert('Failed to update product: ' + e.message);
        }
    };

    const handleHideProduct = async (id: string, hidden: boolean) => {
        try {
            await apiFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify({ hidden }) });
            setProducts(await apiFetch<any[]>('/products'));
            alert(hidden ? 'Product hidden' : 'Product shown');
        } catch (e: any) {
            alert('Failed to update product: ' + e.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>

            <section className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Products</div><div className="text-2xl font-semibold">{overview?.productCount ?? '—'}</div></div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Feedback</div><div className="text-2xl font-semibold">{overview?.feedbackCount ?? '—'}</div></div>
                {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Top Rated</div><div className="text-sm">{ratings.slice(0, 3).map(r => r._id).join(', ')}</div></div> */}
            </section>



            <section className="space-y-2">
                <h2 className="font-semibold">Notifications</h2>
                <div className="flex gap-2">
                    <input className="w-56 rounded-lg border border-gray-300 px-3 py-2" placeholder="Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
                    <input className="flex-1 rounded-lg border border-gray-300 px-3 py-2" placeholder="Message" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
                    <button className="bg-blue-600 text-white px-3 rounded-lg" onClick={handleBroadcast}>Send</button>
                </div>
            </section>



            <section className="space-y-2">
                <h2 className="font-semibold">Product Management</h2>
                <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-3 rounded-lg" onClick={() => setShowAddProduct(true)}>Add Product</button>
                </div>
                <div className="space-y-2">
                    {products.map(p => (
                        <div key={p._id} className="flex justify-between items-center p-2 border rounded">
                            <div>
                                <strong>{p.name}</strong> - ${p.price} - Stock: {p.inventory} {p.hidden && <span className="text-red-500">(Hidden)</span>}
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-yellow-500 text-white px-2 rounded" onClick={() => setEditingProduct(p)}>Edit</button>
                                <button className="bg-red-500 text-white px-2 rounded" onClick={() => handleHideProduct(p._id, !p.hidden)}>
                                    {p.hidden ? 'Show' : 'Hide'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {showAddProduct && <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddProduct(false)} />}
            {editingProduct && <ProductForm product={editingProduct} onSave={handleEditProduct} onCancel={() => setEditingProduct(null)} />}
        </div>
    );
}

function ProductPicker({ onPick }: { onPick: (id: string) => void }) {
    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        apiFetch<any[]>('/products').then(setProducts);
    }, []);
    return (
        <select className="rounded-lg border border-gray-300 px-3 py-2" onChange={e => onPick(e.target.value)} defaultValue="">
            <option value="" disabled>Select a product</option>
            {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
            ))}
        </select>
    );
}

function ProductForm({ product, onSave, onCancel }: { product?: any; onSave: (p: any) => void; onCancel: () => void }) {
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        inventory: product?.inventory || 0,
        seasonalTag: product?.seasonalTag || '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border p-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    <input className="w-full border p-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                    <input className="w-full border p-2" type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} required />
                    <input className="w-full border p-2" type="number" placeholder="Inventory" value={form.inventory} onChange={e => setForm({ ...form, inventory: parseInt(e.target.value) })} required />
                    <input className="w-full border p-2" placeholder="Seasonal Tag" value={form.seasonalTag} onChange={e => setForm({ ...form, seasonalTag: e.target.value })} />
                    <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}