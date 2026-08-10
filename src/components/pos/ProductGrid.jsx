import ProductCard from "./ProductCard";

export default function ProductGrid({ products, loading, onAddToCart }) {
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl bg-white shadow-sm">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl bg-white p-6 shadow-sm">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl bg-white p-4 shadow-sm">
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}
