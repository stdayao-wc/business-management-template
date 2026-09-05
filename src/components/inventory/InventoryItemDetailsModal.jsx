"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import { useAuth } from "@/context/AuthContext";

import {
  getInventoryLocations,
  updateInventoryItemLocation,
} from "@/services/inventory";

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

  const [locations, setLocations] = useState([]);

  const [locationsLoading, setLocationsLoading] = useState(false);

  const [selectedLocationId, setSelectedLocationId] = useState("");

  if (!item) {
    return null;
  }

  const isDamaged = item.status?.name === INVENTORY_ITEM_STATUSES.DAMAGED;

  const locationChanged =
    selectedLocationId && selectedLocationId !== item.location_id;

  useEffect(() => {
    if (!open || !item) {
      return;
    }

    setSelectedLocationId(item.location_id ?? "");

    async function loadLocations() {
      try {
        setLocationsLoading(true);

        const data = await getInventoryLocations();

        setLocations(data);
      } catch (error) {
        console.error("Failed to load inventory locations:", error);

        alert(error?.message || "Unable to load inventory locations.");
      } finally {
        setLocationsLoading(false);
      }
    }

    loadLocations();
  }, [open, item]);

  async function handleUpdateLocation() {
    try {
      if (!locationChanged) {
        return;
      }

      setLoading(true);

      await updateInventoryItemLocation({
        inventoryItemId: item.id,
        locationId: selectedLocationId,
        performedBy: user.id,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update inventory item location:", error);

      alert(error?.message || "Unable to update inventory item location.");
    } finally {
      setLoading(false);
    }
  }

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
            <label className="mb-1 block text-sm text-gray-500">Location</label>

            {locationsLoading ? (
              <div className="rounded-lg border px-3 py-2 text-sm text-gray-500">
                Loading locations...
              </div>
            ) : (
              <select
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
                disabled={loading || locations.length === 0}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locations.length === 0 ? (
                  <option value="">No active locations</option>
                ) : (
                  locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))
                )}
              </select>
            )}
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

        {locationChanged && (
          <div className="border-t pt-5">
            <button
              type="button"
              onClick={handleUpdateLocation}
              disabled={loading || locationsLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating Location..." : "Update Location"}
            </button>
          </div>
        )}

        {isDamaged && (
          <div className={locationChanged ? "" : "border-t pt-5"}>
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
