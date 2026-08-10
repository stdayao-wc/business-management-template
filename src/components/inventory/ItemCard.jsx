import Image from "next/image";

import StatusPill from "./StatusPill";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";

export default function ItemCard({
    mode = "catalog",

    product,

    onEdit,
    onDelete,

    onReceiveStock,
    onDamageStock,
    onViewItems,
}) {
  const isCatalog = mode === "catalog";
  const isInventory = mode === "inventory";
  const { can } = useAuth();
  const canEdit = can("products.update");
  const canDelete = can("products.delete");

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

        <div className="mt-auto space-y-4 pt-5">
          {isInventory && <StatusPill stock={product.stock} />}

          {isInventory && (
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onReceiveStock?.(product)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                        Receive
                    </button>

                    <button
                        type="button"
                        onClick={() => onDamageStock?.(product)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Damage
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onViewItems?.(product)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
                >
                    View Items
                </button>
            </div>
        )}

          <div className="flex gap-2">
            {isCatalog && (
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit?.(product)}
                    className="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete?.(product)}
                    className="flex-1 rounded-lg border border-red-600 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
