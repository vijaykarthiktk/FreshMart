import type { Route } from "./+types/orders";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { AuthGate, LogoutButton, useUser } from '../components/AuthGate';
import { Card } from "~/components/ui/Card";
import { Label } from "~/components/ui/label";

interface Order {
    _id: string;
    userId: string;
    productId: {
        _id: string;
        name: string;
        description: string;
        price: number;
    };
    quantity: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Orders - FreshMart' }
    ];
}

export default function OrdersPage() {
    return (
        <AuthGate>
            <OrdersInner />
        </AuthGate>
    );
}

function OrdersInner() {
    const [orders, setOrders] = useState<Order[]>([]);
    const { user } = useUser();

    useEffect(() => {
        apiFetch<Order[]>('/orders').then(setOrders).catch(console.error);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Orders</h1>
                <div className="text-sm text-gray-600">{user?.email} <LogoutButton /></div>
            </div>

            {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
            ) : (
                <div className="grid md:grid-cols-1 gap-5">
                    {orders.map(order => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between">
                <h3 className="font-semibold">{order.productId.name}</h3>
                <Label>${order.total.toFixed(2)}</Label>
            </div>
            <Label className="text-sm text-gray-600">{order.productId.description}</Label>
            <Label className="text-sm">Quantity: {order.quantity}</Label>
            <Label className="text-sm">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</Label>
        </Card>
    );
}