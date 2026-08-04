import Image from "next/image";

export default function ProductCard({
    product,
}) {
    return (
        <div className="rounded-lg border p-4">

            <Image
                src={product.image_url}
                alt={product.name}
                width={150}
                height={150}
                className="mx-auto"
            />

            <h3 className="mt-4 font-semibold">
                {product.name}
            </h3>

            <p className="text-sm text-gray-500">
                SKU: {product.sku}
            </p>

            <p className="mt-2 font-bold">
                ₱{product.selling_price}
            </p>

            <p className="text-sm">
                Stock: {product.stock}
            </p>

        </div>
    );
}