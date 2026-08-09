"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import { TRANSACTION_CONFIG } from "@/app/config/inventoryTransactionConfig";

import { useAuth } from "@/context/AuthContext";

export default function InventoryTransactionDialog({
  open,

  product,

  type,

  onClose,

  onSuccess,
}) {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const config = TRANSACTION_CONFIG[type];

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open, product, type]);

  if (!config || !product) {
    return null;
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      if (!config?.service) {
        throw new Error(`${config.title} is not implemented yet.`);
      }

      await config.service({
          productId: product.id,
          quantity,
          performedBy: user.id,
      });

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">{config.title}</h2>

          <p className="text-sm text-gray-500 mt-1">{product.name}</p>

          <p className="text-xs text-gray-400">SKU: {product.sku}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>

          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            {loading ? config.loading : config.action}
          </button>
        </div>
      </div>
    </Modal>
  );
}
