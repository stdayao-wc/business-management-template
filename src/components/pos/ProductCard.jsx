import Image from "next/image";

export default function ProductCard({ product }) {
    return (
        <div className="rounded-lg border p-4">

            <Image
                src={product.image_url}
                alt={product.name}
                width={150}
                height={150}
                className="mx-auto h-auto"
            />

            <h3 className="mt-4 font-semibold">
                {product.name}
            </h3>

            <p className="text-sm text-gray-500">
                SKU: {product.sku}
            </p>

            <p className="mt-2 text-lg font-bold">
                ₱{Number(product.selling_price).toFixed(2)}
            </p>

            <p
                className={`mt-2 text-sm font-medium ${
                    product.is_out_of_stock
                        ? "text-red-600"
                        : "text-green-600"
                }`}
            >
                {product.is_out_of_stock
                    ? "Out of Stock"
                    : `${product.available_stock} in stock`}
            </p>

        </div>
    );
}