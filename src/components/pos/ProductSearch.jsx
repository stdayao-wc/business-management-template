"use client";

export default function ProductSearch({ value, onChange }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg bg-gray-50 px-4 py-2 outline-none transition focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
