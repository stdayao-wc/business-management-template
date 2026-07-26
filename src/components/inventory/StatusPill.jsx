export default function StatusPill({ stock = 0 }) {
  const inStock = stock > 0;

  return (
    <div className="flex items-center justify-between">
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </span>

      <span className="text-sm font-medium text-gray-600">{stock} units</span>
    </div>
  );
}
