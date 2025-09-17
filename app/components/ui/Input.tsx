import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            className={[
                "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
                "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                className,
            ].join(" ")}
            {...props}
        />
    );
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={[
                "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm min-h-24",
                "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                className,
            ].join(" ")}
            {...props}
        />
    );
}