import Image from "next/image";

import StatusPill from "./StatusPill";

export default function ItemCard({ product }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-5 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h2 className="text-xl font-semibold">{product.name}</h2>

        <p className="mt-1 text-sm text-gray-500">SKU: {product.sku || "-"}</p>

        <p className="mt-3 text-sm text-gray-600">
          {product.categories?.name ?? "No Category"}
        </p>

        <p className="text-sm text-gray-600">
          {product.brands?.name ?? "No Brand"}
        </p>

        <p className="mt-4 text-lg font-semibold">
          ₱{Number(product.selling_price ?? 0).toLocaleString()}
        </p>

        <div className="mt-auto pt-5">
          <StatusPill active={product.is_active} />
        </div>
      </div>
    </div>
  );
}
