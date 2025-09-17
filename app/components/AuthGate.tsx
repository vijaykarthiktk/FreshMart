import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase.client';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/label';

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
        <Card className="w-full max-w-lg m-auto">
            <CardHeader>
                <CardTitle>Welcome to FreshMart</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" onClick={login}>
                    Login
                </Button>
                <Button variant="outline" className="w-full" onClick={register}>
                    Register
                </Button>
            </CardFooter>
        </Card>
        // <div className="max-w-md mx-auto p-6 space-y-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
        //     <h2 className="text-xl font-semibold">Welcome to FreshMart</h2>
        //     <p className="text-sm text-gray-600">Login or create an account to continue.</p>
        //     <div className="space-y-2">
        //         <Input className="w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        //         <Input className="w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        //     </div>
        //     {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">{error}</div>}
        //     <div className="flex gap-2">
        //         <Button variant='outline' onClick={login}>Login</Button>
        //         <Button variant='outline' onClick={register}>Register</Button>
        //     </div>
        // </div>
    );
}

export function LogoutButton() {
    return <button className="text-sm underline" onClick={() => signOut(auth)}>Logout</button>;
}