import { supabase } from "@/lib/supabase/client";

const INVENTORY_TABLE = "inventory_items";
const STATUS_TABLE = "inventory_item_statuses";
const PRODUCTS_TABLE = "products";
const IN_STOCK_STATUS = "IN_STOCK";

const ITEM_CODE_PADDING = 6;

async function getInStockStatus() {
    const { data, error } = await supabase
        .from(STATUS_TABLE)
        .select("id, name")
        .eq("name", IN_STOCK_STATUS)
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

export async function receiveStock(productId, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer.");
    }

    const product = await getProduct(productId);
    const status = await getInStockStatus();
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

export async function getInventoryCounts(productIds) {
    if (productIds.length === 0) {
        return {};
    }

    const status = await getInStockStatus();

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