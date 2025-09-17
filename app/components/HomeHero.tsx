import React from "react";
import { Link } from "react-router";
import Button from "./ui/Button";

export default function HomeHero() {
    return (
        <section className="pt-6">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white p-8 md:p-12 shadow-lg">
                <div className="max-w-2xl space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">Fresh groceries, smarter shopping.</h1>
                    <p className="text-white/90 text-base md:text-lg">Browse products, see real-time updates, and share quick feedback to help others pick the best.</p>
                    <div className="flex gap-3 pt-2">
                        <Link to="/products"><Button size="lg" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white">Shop Products</Button></Link>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
                {features.map((f) => (
                    <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="text-2xl">{f.emoji}</div>
                        <h3 className="mt-2 font-semibold">{f.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

const features = [
    { emoji: "⚡", title: "Live updates", desc: "Products and notifications stream in realtime." },
    { emoji: "⭐", title: "Quick feedback", desc: "Rate and comment to guide smarter purchases." },
    { emoji: "📈", title: "Insights", desc: "Admins track price trends and top-rated items." },
];