import React from "react";
import { Link } from "react-router";

export function LayoutShell({ children }: React.PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-8">{children}</main>
            <footer className="border-t mt-8 py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} FreshMart</footer>
        </div>
    );
}

function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-40 backdrop-blur bg-white/70 border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600" />
                    <span className="font-semibold">FreshMart</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                    <Link to="/products" className="hover:underline">Products</Link>
                    <Link to="/orders" className="hover:underline">Orders</Link>
                    <Link to="/feedback" className="hover:underline">Feedback</Link>
                    <Link to="/admin" className="hover:underline">Admin</Link>
                </nav>
            </div>
        </header>
    );
}