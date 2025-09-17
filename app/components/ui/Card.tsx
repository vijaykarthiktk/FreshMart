import React from "react";

export function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={[
            "rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow",
            className,
        ].join(" ")}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
    return <div className={["px-4 py-3 border-b border-gray-100", className].join(" ")}>{children}</div>;
}

export function CardContent({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
    return <div className={["px-4 py-3", className].join(" ")}>{children}</div>;
}

export function Badge({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <span className={["inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium border border-emerald-200", className].join(" ")}>{children}</span>
    );
}