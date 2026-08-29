"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import { TRANSACTION_CONFIG } from "@/app/config/inventoryTransactionConfig";
import { INVENTORY_TRANSACTION_TYPES } from "@/constants/inventoryTransactions";
import { INVENTORY_ITEM_STATUSES } from "@/constants/inventoryStatuses";

import { useAuth } from "@/context/AuthContext";

import { getInventoryItems } from "@/services/inventory";
import { damageInventoryItems } from "@/services/inventoryDamage";

export default function InventoryTransactionDialog({
  open,
  product,
  type,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  const config = TRANSACTION_CONFIG[type];

  const isDamage = type === INVENTORY_TRANSACTION_TYPES.DAMAGE;

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuantity(1);
    setSelectedItemIds([]);
    setInventoryItems([]);

    if (!isDamage || !product) {
      return;
    }

    async function loadAvailableItems() {
      try {
        setItemsLoading(true);

        const items = await getInventoryItems(product.id);

        const availableItems = items.filter(
          (item) => item.status?.name === INVENTORY_ITEM_STATUSES.IN_STOCK,
        );

        setInventoryItems(availableItems);
      } catch (error) {
        console.error(error);
        alert(error?.message || "Unable to load inventory items.");
      } finally {
        setItemsLoading(false);
      }
    }

    loadAvailableItems();
  }, [open, product, type, isDamage]);

  if (!config || !product) {
    return null;
  }

  function toggleItem(itemId) {
    setSelectedItemIds((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      return [...current, itemId];
    });
  }

  function selectAllItems() {
    setSelectedItemIds(inventoryItems.map((item) => item.id));
  }

  function clearSelectedItems() {
    setSelectedItemIds([]);
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      if (isDamage) {
        if (selectedItemIds.length === 0) {
          throw new Error("Select at least one inventory item to damage.");
        }

        await damageInventoryItems({
          productId: product.id,
          inventoryItemIds: selectedItemIds,
          performedBy: user.id,
        });
      } else {
        if (!config?.service) {
          throw new Error(`${config.title} is not implemented yet.`);
        }

        await config.service({
          productId: product.id,
          quantity,
          performedBy: user.id,
        });
      }

      onSuccess?.();

      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">{config.title}</h2>

          <p className="mt-1 text-sm text-gray-500">{product.name}</p>

          <p className="text-xs text-gray-400">SKU: {product.sku}</p>
        </div>

        {isDamage ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Select items to damage
              </label>

              <span className="text-sm text-gray-500">
                {selectedItemIds.length} selected
              </span>
            </div>

            {itemsLoading ? (
              <div className="rounded-lg border p-4 text-sm text-gray-500">
                Loading inventory items...
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-gray-500">
                No items are currently in stock.
              </div>
            ) : (
              <>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAllItems}
                    disabled={loading}
                    className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={clearSelectedItems}
                    disabled={loading || selectedItemIds.length === 0}
                    className="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-2">
                  {inventoryItems.map((item) => {
                    const selected = selectedItemIds.includes(item.id);

                    return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          selected ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleItem(item.id)}
                          disabled={loading}
                          className="h-4 w-4"
                        />

                        <div>
                          <p className="text-sm font-medium">
                            {item.item_code}
                          </p>

                          <p className="text-xs text-gray-500">In Stock</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium">Quantity</label>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={loading}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              itemsLoading ||
              (isDamage && selectedItemIds.length === 0)
            }
            className={`rounded-lg px-4 py-2 text-white ${
              isDamage
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-gray-800"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading ? config.loading : config.action}
          </button>
        </div>
      </div>
    </Modal>
  );
}
