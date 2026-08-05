import { supabase } from "@/lib/supabase/client";
import { getProducts } from "./products";

import {
    getAvailableStock,
    getAvailableInventoryItems,
    sellInventoryItems,
    updateProductStock,
} from "./inventory";

/**
 * Calculate cart totals.
 */

export const INVENTORY_STATUS = {
    IN_STOCK: "IN_STOCK",
    RESERVED: "RESERVED",
    SOLD: "SOLD",
    PACKED: "PACKED",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED",
    DAMAGED: "DAMAGED",
    LOST: "LOST",
};

const statusCache = {};

/**
 * Returns the UUID for an inventory status.
 * Status IDs are cached after the first lookup.
 */
export async function getInventoryStatusId(statusName) {
    if (statusCache[statusName]) {
        return statusCache[statusName];
    }

    const { data, error } = await supabase
        .from("inventory_item_statuses")
        .select("id")
        .eq("name", statusName)
        .single();

    if (error) {
        throw error;
    }

    statusCache[statusName] = data.id;

    return data.id;
}

export function calculateTotals(cart) {
    let subtotal = 0;

    for (const item of cart) {
        subtotal += item.product.selling_price * item.quantity;
    }

    return {
        subtotal,
        total: subtotal,
    };
}

/**
 * Validate cart before checkout.
 */
export async function validateCart(cart) {
    if (!cart.length) {
        return {
            valid: false,
            message: "Cart is empty.",
        };
    }

    for (const item of cart) {
        if (item.quantity <= 0) {
            return {
                valid: false,
                message: `${item.product.name} has an invalid quantity.`,
            };
        }

        const availableItems =
            await getAvailableInventoryItems(
                item.product.id,
                item.quantity
            );

        if (availableItems.length < item.quantity) {
            return {
                valid: false,
                message: `Not enough stock for ${item.product.name}.`,
            };
        }
    }

    return {
        valid: true,
    };
}

/**
 * Generate a receipt number.
 *
 * MVP implementation.
 * Later this can become a PostgreSQL function.
 */
function generateReceiptNumber() {
    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const random =
        Math.floor(Math.random() * 999999)
            .toString()
            .padStart(6, "0");

    return `POS-${date}-${random}`;
}

/**
 * Create the sale record.
 */
async function createSale({
    cashierId,
    totals,
    paymentMethod,
    amountReceived,
    changeGiven,
    notes,
}) {
    const { data, error } = await supabase
        .from("sales")
        .insert({
            receipt_number: generateReceiptNumber(),
            cashier_id: cashierId,
            subtotal: totals.subtotal,
            total: totals.total,
            payment_method: paymentMethod,
            amount_received: amountReceived,
            change_given: changeGiven,
            notes,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Create sale item records.
 */
async function createSaleItems(saleId, cart) {
    const rows = cart.map((item) => ({
        sale_id: saleId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.selling_price,
        cost_price: item.product.cost_price,
        line_total:
            item.product.selling_price * item.quantity,
    }));

    const { error } = await supabase
        .from("sale_items")
        .insert(rows);

    if (error) {
        throw error;
    }
}

/**
 * Checkout.
 *
 * Inventory integration will be added next.
 */
export async function checkout({
    cashierId,
    cart,
    paymentMethod = "Cash",
    amountReceived,
    changeGiven,
    notes = "",
}) {
    const validation = await validateCart(cart);

    if (!validation.valid) {
        throw new Error(validation.message);
    }

    const totals = calculateTotals(cart);

    const sale = await createSale({
        cashierId,
        totals,
        paymentMethod,
        amountReceived,
        changeGiven,
        notes,
    });

    await createSaleItems(sale.id, cart);

    for (const item of cart) {
        const inventoryItems =
            await getAvailableInventoryItems(
                item.product.id,
                item.quantity
            );

        await sellInventoryItems(inventoryItems);

        await updateProductStock(item.product.id);
    }

    return sale;
}

export async function getAvailableStockMap() {
    const inStockStatusId =
        await getInventoryStatusId(INVENTORY_STATUS.IN_STOCK);

    const { data, error } = await supabase
        .from("inventory_items")
        .select("product_id")
        .eq("status_id", inStockStatusId);

    if (error) {
        throw error;
    }

    const stockMap = {};

    for (const item of data) {
        stockMap[item.product_id] =
            (stockMap[item.product_id] ?? 0) + 1;
    }

    return stockMap;
}

/**
 * Returns products prepared for the POS.
 *
 * The POS should display all active products,
 * including those that are currently out of stock.
 */
export async function getPOSProducts() {
    const [products, stockMap] = await Promise.all([
        getProducts(),
        getAvailableStockMap(),
    ]);

    return products.map(product => {
        const availableStock =
            stockMap[product.id] ?? 0;

        return {
            ...product,

            available_stock: availableStock,

            is_out_of_stock: availableStock === 0,
        };
    });
}