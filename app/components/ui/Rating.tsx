import React from "react";

interface RatingProps {
    value: number;
    onChange?: (val: number) => void;
    size?: "sm" | "md" | "lg";
}

const faces = ['😡', '😞', '😐', '🙂', '😍'];

export function Rating({ value, onChange, size = "md" }: RatingProps) {
    const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
    return (
        <div role="radiogroup" aria-label="Rating" className="flex select-none">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange?.(n)}
                    aria-pressed={value >= n}
                    aria-label={`${n} out of 5`}
                    className={[
                        textSize,
                        'leading-none px-1 transition-opacity',
                        value >= n ? 'opacity-100' : 'opacity-40',
                        onChange ? 'hover:opacity-100 focus:outline-none' : 'cursor-default',
                    ].join(' ')}
                >
                    {faces[n - 1]}
                </button>
            ))}
        </div>
    );
}