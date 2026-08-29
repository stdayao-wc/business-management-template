"use client";

import { useState } from "react";

import Modal from "@/components/common/Modal";

import { useAuth } from "@/context/AuthContext";

import { restoreDamagedInventoryItems } from "@/services/inventoryDamage";

import { INVENTORY_ITEM_STATUSES } from "@/constants/inventoryStatuses";

export default function InventoryItemDetailsModal({
  open,
  item,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  if (!item) {
    return null;
  }

  const isDamaged = item.status?.name === INVENTORY_ITEM_STATUSES.DAMAGED;

  async function handleRestore() {
    try {
      setLoading(true);

      await restoreDamagedInventoryItems({
        inventoryItemIds: [item.id],
        performedBy: user.id,
        notes: "Damaged item repaired and returned to stock.",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to restore inventory item:", error);

      alert(error?.message || "Unable to restore inventory item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title="Inventory Item" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-500">Item Code</p>

          <p className="text-lg font-semibold">{item.item_code}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Product</p>

          <p className="font-medium">{item.product?.name ?? "-"}</p>

          <p className="text-sm text-gray-500">
            SKU: {item.product?.sku ?? "-"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Status</p>

            <p className="font-medium">{item.status?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>

            <p className="font-medium">{item.location?.name ?? "-"}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Received</p>

            <p className="font-medium">
              {item.received_at
                ? new Date(item.received_at).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Sold</p>

            <p className="font-medium">
              {item.sold_at ? new Date(item.sold_at).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        {isDamaged && (
          <div className="border-t pt-5">
            <button
              type="button"
              onClick={handleRestore}
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Restoring..." : "Mark Back in Stock"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
