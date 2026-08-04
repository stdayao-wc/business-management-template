import { supabase } from "@/lib/supabase/client";

/**
 * Calculate cart totals.
 */
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
export function validateCart(cart) {
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
    const validation = validateCart(cart);

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

    return sale;
}