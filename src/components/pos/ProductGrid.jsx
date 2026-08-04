import ProductCard from "./ProductCard";

export default function ProductGrid({
    products,
    loading,
}) {
    if (loading) {
        return (
            <div className="rounded-lg border p-4">
                Loading...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="rounded-lg border p-4">
                No products found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
}