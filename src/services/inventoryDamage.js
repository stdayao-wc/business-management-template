import { supabase } from "@/lib/supabase/client";
import { INVENTORY_ITEM_STATUSES } from "@/constants/inventoryStatuses";

const INVENTORY_TABLE = "inventory_items";
const STATUS_TABLE = "inventory_item_statuses";
const TRANSACTIONS_TABLE = "inventory_transactions";

const statusCache = {};

async function getInventoryStatus(statusName) {
    if (statusCache[statusName]) {
        return statusCache[statusName];
    }

    const { data, error } = await supabase
        .from(STATUS_TABLE)
        .select("id, name")
        .eq("name", statusName)
        .single();

    if (error) {
        throw error;
    }

    statusCache[statusName] = data;

    return data;
}

async function createDamageTransaction({
    inventoryItemId,
    fromStatusId,
    toStatusId,
    locationId,
    performedBy,
    transactionType,
    notes = null,
}) {
    const { error } = await supabase
        .from(TRANSACTIONS_TABLE)
        .insert({
            inventory_item_id: inventoryItemId,
            transaction_type: transactionType,
            from_status_id: fromStatusId,
            to_status_id: toStatusId,
            from_location_id: locationId,
            to_location_id: locationId,
            performed_by: performedBy,
            sale_id: null,
            notes,
        });

    if (error) {
        throw error;
    }
}

/**
 * Marks specific IN_STOCK inventory items as DAMAGED.
 */
export async function damageInventoryItems({
    productId,
    inventoryItemIds,
    performedBy,
    notes = null,
}) {
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    if (!performedBy) {
        throw new Error(
            "User performing the inventory transaction is required."
        );
    }

    if (!Array.isArray(inventoryItemIds) || inventoryItemIds.length === 0) {
        throw new Error(
            "At least one inventory item must be selected."
        );
    }

    const uniqueItemIds = [...new Set(inventoryItemIds)];

    const inStockStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );

    const damagedStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.DAMAGED
    );

    /*
     * Only update items that:
     * - belong to the selected product
     * - are currently IN_STOCK
     *
     * This protects against an item being sold/reserved/etc.
     * between selection and submission.
     */
    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .update({
            status_id: damagedStatus.id,
        })
        .in("id", uniqueItemIds)
        .eq("product_id", productId)
        .eq("status_id", inStockStatus.id)
        .select(`
            id,
            product_id,
            item_code,
            status_id,
            location_id
        `);

    if (error) {
        throw error;
    }

    if (data.length !== uniqueItemIds.length) {
        throw new Error(
            "One or more selected inventory items are no longer available to damage."
        );
    }

    for (const item of data) {
        await createDamageTransaction({
            inventoryItemId: item.id,
            fromStatusId: inStockStatus.id,
            toStatusId: damagedStatus.id,
            locationId: item.location_id,
            performedBy,
            transactionType: "DAMAGE",
            notes,
        });
    }

    return {
        quantity: data.length,
        items: data,
    };
}

/**
 * Restores specific DAMAGED inventory items back to IN_STOCK.
 */
export async function restoreDamagedInventoryItems({
    inventoryItemIds,
    performedBy,
    notes = null,
}) {
    if (!performedBy) {
        throw new Error(
            "User performing the inventory transaction is required."
        );
    }

    if (!Array.isArray(inventoryItemIds) || inventoryItemIds.length === 0) {
        throw new Error(
            "At least one inventory item must be selected."
        );
    }

    const uniqueItemIds = [...new Set(inventoryItemIds)];

    const damagedStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.DAMAGED
    );

    const inStockStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );

    /*
     * Only restore items that are currently DAMAGED.
     */
    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .update({
            status_id: inStockStatus.id,
        })
        .in("id", uniqueItemIds)
        .eq("status_id", damagedStatus.id)
        .select(`
            id,
            product_id,
            item_code,
            status_id,
            location_id
        `);

    if (error) {
        throw error;
    }

    if (data.length !== uniqueItemIds.length) {
        throw new Error(
            "One or more selected inventory items are no longer damaged and could not be restored."
        );
    }

    for (const item of data) {
        await createDamageTransaction({
            inventoryItemId: item.id,
            fromStatusId: damagedStatus.id,
            toStatusId: inStockStatus.id,
            locationId: item.location_id,
            performedBy,
            transactionType: "RESTORE",
            notes,
        });
    }

    return {
        quantity: data.length,
        items: data,
    };
}