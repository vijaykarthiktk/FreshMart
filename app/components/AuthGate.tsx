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
        <div className="max-w-md mx-auto p-4 space-y-3">
            <h2 className="text-xl font-semibold">Login or Register</h2>
            <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-3 py-2" onClick={login}>Login</button>
                <button className="bg-gray-700 text-white px-3 py-2" onClick={register}>Register</button>
                <button className="bg-red-600 text-white px-3 py-2" onClick={google}>Google</button>
            </div>
        </div>
    );
}

export function LogoutButton() {
    return <button className="text-sm underline" onClick={() => signOut(auth)}>Logout</button>;
}