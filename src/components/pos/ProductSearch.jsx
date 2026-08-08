"use client";

export default function ProductSearch({
    value,
    onChange,
}) {
    return (
        <div>
            <input
                type="search"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder="Search products..."
                className="w-full rounded-lg border px-4 py-2"
            />
        </div>
    );
}