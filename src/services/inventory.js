import { supabase } from "@/lib/supabase/client";
import { INVENTORY_ITEM_STATUSES } from "@/constants/inventoryStatuses";

const INVENTORY_TABLE = "inventory_items";
const STATUS_TABLE = "inventory_item_statuses";
const PRODUCTS_TABLE = "products";

const ITEM_CODE_PADDING = 6;

async function getInventoryStatus(statusName) {
    const { data, error } = await supabase
        .from(STATUS_TABLE)
        .select("id, name")
        .eq("name", statusName)
        .single();

    if (error) throw error;

    return data;
}

async function getProduct(productId) {
    const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .select("id, sku")
        .eq("id", productId)
        .single();

    if (error) throw error;

    return data;
}

async function getInventoryCount(productId) {
    const { count, error } = await supabase
        .from(INVENTORY_TABLE)
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("product_id", productId);

    if (error) throw error;

    return count ?? 0;
}

function generateItemCode(sku, sequence) {
    return `${sku}-${String(sequence).padStart(
        ITEM_CODE_PADDING,
        "0"
    )}`;
}

function buildInventoryItems(
    product,
    statusId,
    startSequence,
    quantity
) {
    return Array.from({ length: quantity }, (_, index) => ({
        product_id: product.id,
        item_code: generateItemCode(
            product.sku,
            startSequence + index
        ),
        status_id: statusId,
    }));
}

export async function receiveStock({
    productId,
    quantity,
}) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer.");
    }

    const product = await getProduct(productId);
    const status = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );
    const currentCount = await getInventoryCount(productId);

    const items = buildInventoryItems(
        product,
        status.id,
        currentCount + 1,
        quantity
    );

    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .insert(items)
        .select();

    if (error) throw error;

    return {
        product,
        quantity,
        items: data,
    };
}

async function updateInventoryItemStatus({
    productId,
    quantity,
    fromStatus,
    toStatus,
}) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
            "Quantity must be a positive integer."
        );
    }

    const sourceStatus = await getInventoryStatus(fromStatus);
    const destinationStatus = await getInventoryStatus(toStatus);

    const { data: items, error } = await supabase
        .from(INVENTORY_TABLE)
        .select("*")
        .eq("product_id", productId)
        .eq("status_id", sourceStatus.id)
        .order("id")
        .limit(quantity);

    if (error) throw error;

    if (items.length < quantity) {
        throw new Error(
            `Only ${items.length} item(s) available.`
        );
    }

    const ids = items.map((item) => item.id);

    const { data, error: updateError } = await supabase
        .from(INVENTORY_TABLE)
        .update({
            status_id: destinationStatus.id,
        })
        .in("id", ids)
        .select();

    if (updateError) throw updateError;

    return {
        quantity,
        items: data,
    };
}

export async function getInventoryCounts(productIds) {
    if (productIds.length === 0) {
        return {};
    }

    const status = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );

    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .select("product_id")
        .eq("status_id", status.id)
        .in("product_id", productIds);

    if (error) throw error;

    const counts = {};

    for (const id of productIds) {
        counts[id] = 0;
    }

    for (const item of data) {
        counts[item.product_id]++;
    }

    return counts;
}

export async function shipStock({
    productId,
    quantity,
}) {
    return updateInventoryItemStatus({
        productId,
        quantity,
        fromStatus:
            INVENTORY_ITEM_STATUSES.IN_STOCK,
        toStatus:
            INVENTORY_ITEM_STATUSES.SHIPPED,
    });
}

export async function reserveStock({
    productId,
    quantity,
}) {
    return updateInventoryItemStatus({
        productId,
        quantity,
        fromStatus:
            INVENTORY_ITEM_STATUSES.IN_STOCK,
        toStatus:
            INVENTORY_ITEM_STATUSES.RESERVED,
    });
}

export async function damageStock({
    productId,
    quantity,
}) {
    return updateInventoryItemStatus({
        productId,
        quantity,
        fromStatus:
            INVENTORY_ITEM_STATUSES.IN_STOCK,
        toStatus:
            INVENTORY_ITEM_STATUSES.DAMAGED,
    });
}

/**
 * Returns the available stock for a product.
 */
export async function getAvailableStock(productId) {
    const inStockStatusId =
        await getInventoryStatusId(INVENTORY_STATUS.IN_STOCK);

    const { count, error } = await supabase
        .from("inventory_items")
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("product_id", productId)
        .eq("status_id", inStockStatusId);

    if (error) {
        throw error;
    }

    return count ?? 0;
}

/**
 * Gets inventory items that can be sold.
 */
export async function getAvailableInventoryItems(
    productId,
    quantity
) {
    const inStockStatusId =
    await getInventoryStatusId(INVENTORY_STATUS.IN_STOCK);

    const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("product_id", productId)
        .eq("status_id", inStockStatusId)
        .limit(quantity);

    if (error) {
        throw error;
    }

    if (data.length < quantity) {
        throw new Error("Not enough stock.");
    }

    return data;
}

/**
 * Marks inventory items as sold.
 */
export async function sellInventoryItems(items) {
    const soldStatusId =
        await getInventoryStatusId(INVENTORY_STATUS.SOLD);

    const ids = items.map(item => item.id);

    const { error } = await supabase
        .from("inventory_items")
        .update({
            status_id: soldStatusId,
            sold_at: new Date().toISOString(),
        })
        .in("id", ids);

    if (error) {
        throw error;
    }
}

/**
 * Synchronizes product stock with inventory.
 */
export async function updateProductStock(productId) {
    const stock = await getAvailableStock(productId);

    const { error } = await supabase
        .from("products")
        .update({
            stock,
        })
        .eq("id", productId);

    if (error) {
        throw error;
    }
}