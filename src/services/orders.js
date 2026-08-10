import { supabase } from "@/lib/supabase/client";

const SALES_TABLE = "sales";

const FULFILLMENT_STATUSES = {
    PENDING: "PENDING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    PICKED_UP: "PICKED_UP",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
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

async function updateFulfillmentStatus(
    orderId,
    nextStatus
) {
    const { data: order, error: fetchError } =
        await supabase
            .from(SALES_TABLE)
            .select(
                "id, shipping_method, fulfillment_status"
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
    orderId
) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.READY_FOR_PICKUP
    );
}

export async function markOrderPickedUp(orderId) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.PICKED_UP
    );
}

export async function markOrderShipped(orderId) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.SHIPPED
    );
}

export async function markOrderDelivered(orderId) {
    return updateFulfillmentStatus(
        orderId,
        FULFILLMENT_STATUSES.DELIVERED
    );
}

export { FULFILLMENT_STATUSES };