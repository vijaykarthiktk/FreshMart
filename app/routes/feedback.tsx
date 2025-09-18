import type { Route } from "./+types/feedback";
import React, { useEffect, useState } from 'react';
import { Rating } from '../components/ui/Rating';
import { apiFetch } from '../lib/api';
import { AuthGate, LogoutButton, useUser } from '../components/AuthGate';
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    inventory: number;
    seasonalTag?: string;
    avgRating?: number;
}

interface FeedbackItem {
    _id: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Feedback - FreshMart' }
    ];
}

export default function FeedbackPage() {
    return (
        <AuthGate>
            <FeedbackInner />
        </AuthGate>
    );
}

function FeedbackInner() {
    const [products, setProducts] = useState<Product[]>([]);
    const { user } = useUser();

    useEffect(() => {
        apiFetch<Product[]>('/products').then(setProducts).catch(() => { });
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Feedback</h1>
                <div className="text-sm text-gray-600">{user?.email} <LogoutButton /></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                    <FeedbackCard key={p._id} product={p} />
                ))}
            </div>
        </div>
    );
}

function FeedbackCard({ product }: { product: Product }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!showComments) return;
        apiFetch<FeedbackItem[]>(`/feedback/${product._id}`).then(setFeedback).catch(console.error);
    }, [showComments, product._id]);

    const submitFeedback = async () => {
        setError(null);
        try {
            await apiFetch(`/feedback/${product._id}`, {
                method: 'POST',
                body: JSON.stringify({ rating, comment }),
            });
            setComment('');
            setShowComments(true);
            const list = await apiFetch<FeedbackItem[]>(`/feedback/${product._id}`);
            setFeedback(list);
        } catch (e: any) {
            const msg = typeof e?.message === 'string' ? e.message : 'Failed to submit feedback. Please try again.';
            setError(msg);
            console.error('Submit feedback failed:', e);
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
            <Label className="text-sm">Avg rating: {product.avgRating?.toFixed(1) || '—'}</Label>

            <div className="pt-2 border-t mt-2 space-y-2">
                <div className="flex items-center gap-2">
                    <Label>Rate:</Label>
                    <div className="flex items-center gap-2">
                        <Rating value={rating} onChange={setRating} />
                        <span className="text-xs text-gray-500">{rating}/5</span>
                    </div>
                </div>
                <Textarea className="border p-2 w-full" placeholder="Comment" value={comment} onChange={e => setComment(e.target.value)} />
                {error && (
                    <div className="p-2 text-sm bg-red-100 border border-red-300 text-red-700">
                        {error}
                    </div>
                )}
                <div className="flex gap-2">
                    <Button variant="default" onClick={submitFeedback}>Submit Feedback</Button>
                    <Button variant="outline" onClick={() => setShowComments(v => !v)}>{showComments ? 'Hide' : 'View'} Recent Comments</Button>
                </div>
                {showComments && (
                    <div className="space-y-2">
                        {feedback.length === 0 && <Label className="text-sm text-gray-500">No comments yet.</Label>}
                        {feedback.map(f => (
                            <div key={f._id} className="text-sm border-t pt-2">
                                <Label className="font-medium">Rating: {f.rating}</Label>
                                {f.comment && <div className="text-gray-700">{f.comment}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}