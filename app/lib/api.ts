import { auth } from './firebase.client';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    let token = '';
    try {
        const user = auth.currentUser;
        if (user) token = await user.getIdToken();
    } catch { }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}