import { supabase } from "@/lib/supabase/client";
import {
    releaseReservedInventoryItems,
    sellReservedInventoryItems,
    returnSoldInventoryItems,
} from "@/services/inventory";

const SALES_TABLE = "sales";

const FULFILLMENT_STATUSES = {
    PENDING: "PENDING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    PICKED_UP: "PICKED_UP",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    VOIDED: "VOIDED",
};

export async function getOrders({
    page = 1,
    pageSize = 5,
} = {}) {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, count, error } = await supabase
        .from(SALES_TABLE)
        .select(
            `
            *,
            cashier:profiles (
                id,
                first_name,
                last_name
            ),
            sale_items (
                id,
                product_id,
                quantity,
                unit_price,
                cost_price,
                line_total,
                product:products (
                    id,
                    sku,
                    name,
                    image_path
                )
            )
            `,
            {
                count: "exact",
            }
        )
        .order("created_at", {
            ascending: false,
        })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        data,
        total: count ?? 0,
        page: safePage,
        pageSize: safePageSize,
    };
}

export async function getOrder(id) {
    const { data, error } = await supabase
        .from(SALES_TABLE)
        .select(`
            *,
            cashier:profiles (
                id,
                first_name,
                last_name
            ),
            sale_items (
                id,
                product_id,
                quantity,
                unit_price,
                cost_price,
                line_total,
                product:products (
                    id,
                    sku,
                    name,
                    image_path
                )
            )
        `)
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

function validateFulfillmentTransition(
    shippingMethod,
    currentStatus,
    nextStatus
) {
    if (shippingMethod === "PICKUP") {
        const valid =
            (currentStatus === "PENDING" &&
                nextStatus === "READY_FOR_PICKUP") ||
            (currentStatus === "READY_FOR_PICKUP" &&
                nextStatus === "PICKED_UP");

        if (!valid) {
            throw new Error(
                `Invalid pickup status transition: ${currentStatus} → ${nextStatus}.`
            );
        }

        return;
    }

    if (
        shippingMethod === "LBC" ||
        shippingMethod === "J&T"
    ) {
        const valid =
            (currentStatus === "PENDING" &&
                nextStatus === "SHIPPED") ||
            (currentStatus === "SHIPPED" &&
                nextStatus === "DELIVERED");

        if (!valid) {
            throw new Error(
                `Invalid delivery status transition: ${currentStatus} → ${nextStatus}.`
            );
        }

        return;
    }

    throw new Error(
        "Invalid shipping method."
    );
}

async function fulfillReservedInventory(
    orderId,
    performedBy
) {
    const {
        data: transactions,
        error,
    } = await supabase
        .from("inventory_transactions")
        .select(`
            inventory_item_id,
            inventory_item:inventory_items (
                id,
                product_id,
                status_id,
                location_id
            )
        `)
        .eq("sale_id", orderId)
        .eq("transaction_type", "ADJUST");

    if (error) {
        throw error;
    }

    const reservedItems =
        transactions
            ?.map(
                (transaction) =>
                    transaction.inventory_item
            )
            .filter(Boolean) ?? [];

    if (reservedItems.length === 0) {
        return [];
    }

    return sellReservedInventoryItems(
        reservedItems,
        performedBy,
        orderId
    );
}

async function updateFulfillmentStatus(
    orderId,
    nextStatus,
    performedBy
) {
    const { data: order, error: fetchError } =
        await supabase
            .from(SALES_TABLE)
            .select(
                "id, shipping_method, fulfillment_status, is_downpayment"
            )
            .eq("id", orderId)
            .single();

    if (fetchError) {
        throw fetchError;
    }

    validateFulfillmentTransition(
        order.shipping_method,
        order.fulfillment_status,
        nextStatus
    );

    if (
        order.is_downpayment &&
        (
            nextStatus === FULFILLMENT_STATUSES.PICKED_UP ||
            nextStatus === FULFILLMENT_STATUSES.DELIVERED
        )
    ) {
        await fulfillReservedInventory(
            orderId,
            performedBy
        );
    }

    const { data, error } = await supabase
        .from(SALES_TABLE)
        .update({
            fulfillment_status: nextStatus,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function markOrderReadyForPickup(
    orderId,
    performedBy
) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.READY_FOR_PICKUP,
        performedBy
    );
}

export async function markOrderPickedUp(
    orderId,
    performedBy
) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.PICKED_UP,
        performedBy
    );
}

export async function markOrderShipped(
    orderId,
    performedBy
) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.SHIPPED,
        performedBy
    );
}

export async function markOrderDelivered(
    orderId,
    performedBy
) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.DELIVERED,
        performedBy
    );
}

export { FULFILLMENT_STATUSES };

export async function voidOrder(
    orderId,
    performedBy
) {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    if (!performedBy) {
        throw new Error(
            "User performing the void is required."
        );
    }

    const {
        data: order,
        error: fetchError,
    } = await supabase
        .from(SALES_TABLE)
        .select(
            "id, fulfillment_status, is_downpayment"
        )
        .eq("id", orderId)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    if (
        order.fulfillment_status ===
        FULFILLMENT_STATUSES.VOIDED
    ) {
        throw new Error(
            "Order has already been voided."
        );
    }

    const canVoid =
        order.fulfillment_status ===
            FULFILLMENT_STATUSES.PENDING ||
        order.fulfillment_status ===
            FULFILLMENT_STATUSES.READY_FOR_PICKUP;

    if (!canVoid) {
        throw new Error(
            "Only orders that have not been picked up or shipped can be voided."
        );
    }

if (order.is_downpayment) {
    const {
        data: reservationTransactions,
        error: reservationError,
    } = await supabase
        .from("inventory_transactions")
        .select(`
            inventory_item_id,
            inventory_item:inventory_items (
                id,
                product_id,
                status_id,
                location_id
            )
        `)
        .eq("sale_id", orderId)
        .eq("transaction_type", "ADJUST");

    if (reservationError) {
        throw reservationError;
    }

    const reservedItems =
        reservationTransactions
            ?.map(
                (transaction) =>
                    transaction.inventory_item
            )
            .filter(Boolean) ?? [];

    await releaseReservedInventoryItems(
        reservedItems,
        performedBy,
        orderId
    );
} else {
    const {
        data: sellTransactions,
        error: sellTransactionError,
    } = await supabase
        .from("inventory_transactions")
        .select(`
            inventory_item_id,
            inventory_item:inventory_items (
                id,
                product_id,
                status_id,
                location_id
            )
        `)
        .eq("sale_id", orderId)
        .eq("transaction_type", "SELL");

    if (sellTransactionError) {
        throw sellTransactionError;
    }

    const soldItems =
        sellTransactions
            ?.map(
                (transaction) =>
                    transaction.inventory_item
            )
            .filter(Boolean) ?? [];

    await returnSoldInventoryItems(
        soldItems,
        performedBy,
        orderId
    );
}

    const {
        data,
        error,
    } = await supabase
        .from(SALES_TABLE)
        .update({
            fulfillment_status:
                FULFILLMENT_STATUSES.VOIDED,
            status: "voided",
            updated_at:
                new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}