import type { Route } from "./+types/products";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { AuthGate, LogoutButton, useUser } from '../components/AuthGate';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase.client';
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/Input";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    inventory: number;
    seasonalTag?: string;
    avgRating?: number;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Products - FreshMart' }
    ];
}

export default function ProductsPage() {
    return (
        <AuthGate>
            <ProductsInner />
        </AuthGate>
    );
}

function ProductsInner() {
    const [products, setProducts] = useState<Product[]>([]);
    const [notif, setNotif] = useState<{ title: string; message: string } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const { user } = useUser();

    useEffect(() => {
        // Initial load (fallback)
        apiFetch<Product[]>('/products').then(setProducts).catch(() => { });

        // Real-time products via Firestore mirror
        const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
            const list: Product[] = snap.docs.map(d => {
                const data = d.data() as any;
                return {
                    _id: d.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    inventory: data.inventory,
                    seasonalTag: data.seasonalTag || undefined,
                    avgRating: data.avgRating || 0,
                } as Product;
            });
            // Keep client list sorted by name for stability
            list.sort((a, b) => a.name.localeCompare(b.name));
            setProducts(list);
        });

        // Real-time notifications via Firestore
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsubNotif = onSnapshot(q, (snap) => {
            const first = snap.docs[0]?.data() as any;
            if (first) setNotif({ title: first.title, message: first.message });
        });
        return () => { unsubProducts(); unsubNotif(); };
    }, []);

    const categories = Array.from(new Set(products.map(p => p.seasonalTag).filter(Boolean)));
    const filteredProducts = selectedCategory ? products.filter(p => p.seasonalTag === selectedCategory) : products;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="text-sm text-gray-600">{user?.email} <LogoutButton /></div>
            </div>

            {notif && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <strong>{notif.title}: </strong>{notif.message}
                </div>
            )}

            <div className="space-y-2">
                <div>
                    <Label>Filter by Category:</Label>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="border p-2 ml-2"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(p => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);

    const buyProduct = async () => {
        try {
            await apiFetch('/orders', {
                method: 'POST',
                body: JSON.stringify({ productId: product._id, quantity }),
            });
            alert(`Ordered ${quantity} x ${product.name} for $${(product.price * quantity).toFixed(2)}`);
        } catch (e: any) {
            alert(`Failed to order: ${e.message || 'Unknown error'}`);
        }
    };

    return (
        <Card className=" p-4">
            <div className="flex justify-between">
                <h3 className="font-semibold">{product.name}</h3>
                <Label>${product.price.toFixed(2)}</Label>
            </div>
            <Label className="text-sm text-gray-600">{product.description}</Label>
            <Label className="text-sm">In stock: {product.inventory} {product.seasonalTag ? `• ${product.seasonalTag}` : ''}</Label>

            <div className="pt-2 border-t mt-2 space-y-2">
                <div className="flex items-center gap-2">
                    <Label>Quantity:</Label>
                    <Input
                        type="number"
                        min="1"
                        max={product.inventory}
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-20"
                    />
                </div>
                <Button variant="default" onClick={buyProduct}>Buy Now</Button>
            </div>
        </Card>
    );
}