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
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [broadcastTitle, setBroadcastTitle] = useState('Flash Sale');
    const [broadcastMsg, setBroadcastMsg] = useState('Bananas 15% off!');

    useEffect(() => {
        apiFetch('/admin/analytics/overview').then(setOverview);
        apiFetch<any[]>('/admin/analytics/ratings').then(setRatings);
    }, []);

    useEffect(() => {
        if (!selectedProduct) return;
        apiFetch<any[]>(`/admin/analytics/price-trends/${selectedProduct}`).then(setPriceHistory);
    }, [selectedProduct]);

    const handleBroadcast = async () => {
        await apiFetch('/notifications/broadcast', { method: 'POST', body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg }) });
        alert('Notification sent');
    };

    const handleAutoAdjust = async () => {
        if (!selectedProduct) return;
        const p = await apiFetch(`/products/${selectedProduct}/auto-adjust`, { method: 'POST' }) as any;
        alert(`New price: $${p.price.toFixed(2)}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>

            <section className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Products</div><div className="text-2xl font-semibold">{overview?.productCount ?? '—'}</div></div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Feedback</div><div className="text-2xl font-semibold">{overview?.feedbackCount ?? '—'}</div></div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-sm text-gray-600">Top Rated</div><div className="text-sm">{ratings.slice(0, 3).map(r => r._id).join(', ')}</div></div>
            </section>

            <section className="space-y-2">
                <h2 className="font-semibold">Price Trends</h2>
                <ProductPicker onPick={setSelectedProduct} />
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm inline-block">
                    <LineChart data={priceHistory.map(h => ({ createdAt: h.createdAt, price: h.newPrice }))} xKey="createdAt" yKey="price" />
                </div>
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
                <h2 className="font-semibold">Auto Price Adjust</h2>
                <div className="flex gap-2 items-center">
                    <ProductPicker onPick={setSelectedProduct} />
                    <button className="bg-green-600 text-white px-3 rounded-lg" onClick={handleAutoAdjust}>Run Auto-Adjust</button>
                </div>
            </section>
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