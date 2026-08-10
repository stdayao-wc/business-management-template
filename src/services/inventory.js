import { supabase } from "@/lib/supabase/client";
import { INVENTORY_ITEM_STATUSES } from "@/constants/inventoryStatuses";

const INVENTORY_TABLE = "inventory_items";
const STATUS_TABLE = "inventory_item_statuses";
const PRODUCTS_TABLE = "products";

const ITEM_CODE_PADDING = 6;
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

    if (error) throw error;

    statusCache[statusName] = data;

    return data;
}

async function getDefaultInventoryLocation() {
    const { data, error } = await supabase
        .from("locations")
        .select("id, name")
        .eq("is_active", true)
        .order("created_at")
        .limit(1)
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
    locationId,
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
        location_id: locationId,
        received_at: new Date().toISOString(),
    }));
}

async function createInventoryTransaction({
    inventoryItemId,
    transactionType,
    fromStatusId = null,
    toStatusId = null,
    fromLocationId = null,
    toLocationId = null,
    performedBy,
    saleId = null,
    notes = null,
}) {
    const { error } = await supabase
        .from("inventory_transactions")
        .insert({
            inventory_item_id: inventoryItemId,
            transaction_type: transactionType,
            from_status_id: fromStatusId,
            to_status_id: toStatusId,
            from_location_id: fromLocationId,
            to_location_id: toLocationId,
            performed_by: performedBy,
            sale_id: saleId,
            notes,
        });

    if (error) throw error;
}

export async function receiveStock({
    productId,
    quantity,
    performedBy,
}) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer.");
    }

    const product = await getProduct(productId);
    const status = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );
    const currentCount = await getInventoryCount(productId);
    const location = await getDefaultInventoryLocation();

    const items = buildInventoryItems(
        product,
        status.id,
        location.id,
        currentCount + 1,
        quantity
    );

    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .insert(items)
        .select();

    if (error) throw error;

    for (const item of data) {
        await createInventoryTransaction({
            inventoryItemId: item.id,
            transactionType: "RECEIVE",
            fromStatusId: null,
            toStatusId: status.id,
            fromLocationId: null,
            toLocationId: location.id,
            performedBy,
        });
    }

    return {
        product,
        quantity,
        items: data,
    };
}

async function updateInventoryItemStatus({
    productId,
    quantity,
    transactionType,
    fromStatus,
    toStatus,
    performedBy,
    saleId = null,
    notes = null,
}) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
            "Quantity must be a positive integer."
        );
    }

    if (!performedBy) {
        throw new Error(
            "User performing the inventory transaction is required."
        );
    }

    const sourceStatus = await getInventoryStatus(
        fromStatus
    );

    const destinationStatus = await getInventoryStatus(
        toStatus
    );

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

    for (const item of items) {
        await createInventoryTransaction({
            inventoryItemId: item.id,

            transactionType,

            fromStatusId: sourceStatus.id,
            toStatusId: destinationStatus.id,

            fromLocationId: item.location_id,
            toLocationId: item.location_id,

            performedBy,

            saleId,
            notes,
        });
    }

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
    performedBy,
    saleId = null,
    notes = null,
}) {
    return updateInventoryItemStatus({
        productId,
        quantity,

        transactionType: "SHIP",

        fromStatus:
            INVENTORY_ITEM_STATUSES.IN_STOCK,

        toStatus:
            INVENTORY_ITEM_STATUSES.SHIPPED,

        performedBy,
        saleId,
        notes,
    });
}

export async function damageStock({
    productId,
    quantity,
    performedBy,
    notes = null,
}) {
    return updateInventoryItemStatus({
        productId,
        quantity,

        transactionType: "DAMAGE",

        fromStatus:
            INVENTORY_ITEM_STATUSES.IN_STOCK,

        toStatus:
            INVENTORY_ITEM_STATUSES.DAMAGED,

        performedBy,
        notes,
    });
}

/**
 * Returns the available stock for a product.
 */
export async function getAvailableStock(productId) {
    const inStockStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );

    const { count, error } = await supabase
        .from(INVENTORY_TABLE)
        .select("*", {
            count: "exact",
            head: true,
        })
        .eq("product_id", productId)
        .eq("status_id", inStockStatus.id);

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
    const inStockStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.IN_STOCK
    );

    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .select("*")
        .eq("product_id", productId)
        .eq("status_id", inStockStatus.id)
        .order("id")
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
export async function sellInventoryItems(
    items,
    performedBy,
    saleId
) {
    if (!performedBy) {
        throw new Error(
            "User performing the inventory transaction is required."
        );
    }

    if (!saleId) {
        throw new Error(
            "Sale ID is required when selling inventory."
        );
    }

    const soldStatus = await getInventoryStatus(
        INVENTORY_ITEM_STATUSES.SOLD
    );

    const ids = items.map((item) => item.id);

    const soldAt = new Date().toISOString();

    const { data, error } = await supabase
        .from(INVENTORY_TABLE)
        .update({
            status_id: soldStatus.id,
            sold_at: soldAt,
        })
        .in("id", ids)
        .select();

    if (error) {
        throw error;
    }

    for (const item of items) {
        await createInventoryTransaction({
            inventoryItemId: item.id,

            transactionType: "SELL",

            fromStatusId: item.status_id,
            toStatusId: soldStatus.id,

            fromLocationId: item.location_id,
            toLocationId: item.location_id,

            performedBy,

            saleId,
        });
    }

    return data;
}



/**
 * Gets all physical inventory items for a product.
 */
export async function getInventoryItems(productId) {
    if (!productId) {
        throw new Error("Product ID is required.");
    }
    
const { data, error } = await supabase
    .from(INVENTORY_TABLE)
    .select(`
        id,
        product_id,
        item_code,
        status_id,
        location_id,
        received_at,
        sold_at
    `)
    .eq("product_id", productId)
    .order("item_code", { ascending: false });

    if (error) throw error;

    if (!data.length) {
        return [];
    }

    const statusIds = [
        ...new Set(
            data
                .map((item) => item.status_id)
                .filter(Boolean)
        ),
    ];

    const locationIds = [
        ...new Set(
            data
                .map((item) => item.location_id)
                .filter(Boolean)
        ),
    ];

    const [
        { data: statuses, error: statusError },
        { data: locations, error: locationError },
    ] = await Promise.all([
        statusIds.length
            ? supabase
                .from(STATUS_TABLE)
                .select("id, name")
                .in("id", statusIds)
            : Promise.resolve({ data: [], error: null }),

        locationIds.length
            ? supabase
                .from("locations")
                .select("id, name")
                .in("id", locationIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (statusError) throw statusError;
    if (locationError) throw locationError;

    const statusMap = Object.fromEntries(
        statuses.map((status) => [status.id, status])
    );

    const locationMap = Object.fromEntries(
        locations.map((location) => [location.id, location])
    );

    return data.map((item) => ({
        ...item,
        status: statusMap[item.status_id] ?? null,
        location: locationMap[item.location_id] ?? null,
    }));
}