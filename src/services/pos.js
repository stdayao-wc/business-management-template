import { supabase } from "@/lib/supabase/client";
import { getProducts } from "./products";

import {
    getInventoryCounts,
    getAvailableInventoryItems,
    sellInventoryItems,
} from "./inventory";

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

    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,

    paymentMethod,
    amountReceived,
    changeGiven,
    notes,
}) {
    const fulfillmentStatus =
        getInitialFulfillmentStatus(shippingMethod);

    const normalizedCustomerName =
        customerName.trim();

    const normalizedCustomerPhone =
        customerPhone.trim();

    const normalizedShippingAddress =
        shippingAddress?.trim() || null;

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

            customer_name: normalizedCustomerName,
            customer_phone: normalizedCustomerPhone,
            shipping_address:
                shippingMethod === "PICKUP"
                    ? null
                    : normalizedShippingAddress,
            shipping_method: shippingMethod,
            fulfillment_status: fulfillmentStatus,
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

    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,

    paymentMethod = "Cash",
    amountReceived,
    changeGiven,
    notes = "",
}) {

    validateShippingDetails({
        shippingMethod,
        customerName,
        customerPhone,
        shippingAddress,
    });

    const validation = await validateCart(cart);

    if (!validation.valid) {
        throw new Error(validation.message);
    }

    const totals = calculateTotals(cart);

    const sale = await createSale({
        cashierId,
        totals,

        shippingMethod,
        customerName,
        customerPhone,
        shippingAddress,

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

        await sellInventoryItems(
            inventoryItems,
            cashierId,
            sale.id
        );
    }

    return sale;
}

/**
 * Returns products prepared for the POS.
 *
 * The POS should display all active products,
 * including those that are currently out of stock.
 */
export async function getPOSProducts() {
    const products = await getProducts();

    const stockMap = await getInventoryCounts(
        products.map((product) => product.id)
    );

    return products.map((product) => {
        const availableStock =
            stockMap[product.id] ?? 0;

        return {
            ...product,

            available_stock: availableStock,

            is_out_of_stock:
                availableStock === 0,
        };
    });
}

function getInitialFulfillmentStatus(shippingMethod) {
    if (shippingMethod === "PICKUP") {
        return "READY_FOR_PICKUP";
    }

    return "PENDING";
}

function isValidPhilippinePhone(phone) {
    const normalized = phone
        .trim()
        .replace(/[\s()-]/g, "");

    return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(
        normalized
    );
}

function validateShippingDetails({
    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,
}) {
    if (!shippingMethod) {
        throw new Error("Shipping method is required.");
    }

    if (!["PICKUP", "LBC", "J&T"].includes(shippingMethod)) {
        throw new Error("Invalid shipping method.");
    }

    if (!customerName?.trim()) {
        throw new Error("Customer name is required.");
    }

    if (!customerPhone?.trim()) {
        throw new Error("Customer number is required.");
    }

    if (!isValidPhilippinePhone(customerPhone)) {
        throw new Error(
            "Please enter a valid Philippine phone number."
        );
    }

    if (
        shippingMethod !== "PICKUP" &&
        !shippingAddress?.trim()
    ) {
        throw new Error(
            "Shipping address is required for delivery."
        );
    }
}