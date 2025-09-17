import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase.client';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export function useUser() {
    const [user, setUser] = useState<null | { uid: string; email: string | null }>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u ? { uid: u.uid, email: u.email } : null);
            setLoading(false);
        });
        return unsub;
    }, []);
    return { user, loading };
}

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useUser();
    if (loading) return <div className="p-4">Loading...</div>;
    if (!user) return <AuthPanel />;
    return <>{children}</>;
};

export function AuthPanel() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const login = async () => {
        setError(null);
        try { await signInWithEmailAndPassword(auth, email, password); } catch (e: any) { setError(e.message); }
    };
    const register = async () => {
        setError(null);
        try { await createUserWithEmailAndPassword(auth, email, password); } catch (e: any) { setError(e.message); }
    };
    const google = async () => {
        setError(null);
        try { await signInWithPopup(auth, googleProvider); } catch (e: any) { setError(e.message); }
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold">Welcome to FreshMart</h2>
            <p className="text-sm text-gray-600">Login or create an account to continue.</p>
            <div className="space-y-2">
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg" onClick={login}>Login</button>
                <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg" onClick={register}>Register</button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg" onClick={google}>Google</button>
            </div>
        </div>
    );
}

export function LogoutButton() {
    return <button className="text-sm underline" onClick={() => signOut(auth)}>Logout</button>;
}