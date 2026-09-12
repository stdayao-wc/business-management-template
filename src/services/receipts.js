import { supabase } from "@/lib/supabase/client";
import { getSalePaymentSummary } from "@/services/salePayments";

async function buildReceipt(data) {
    const cashierName = [
        data.cashier?.first_name,
        data.cashier?.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const paymentSummary =
        await getSalePaymentSummary(data.id);

    return {
        sale: data,

        items: data.sale_items ?? [],

        cashierName:
            cashierName || "Unknown",

        paymentSummary,
    };
}

export async function getReceiptById(
    saleId
) {
    if (!saleId) {
        throw new Error(
            "Sale ID is required."
        );
    }

    const {
        data,
        error,
    } = await supabase
        .from("sales")
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
                    name
                )
            )
        `)
        .eq("id", saleId)
        .single();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "Receipt could not be found."
        );
    }

    return buildReceipt(data);
}

export async function getReceiptByNumber(
    receiptNumber
) {
    if (!receiptNumber?.trim()) {
        throw new Error(
            "Receipt number is required."
        );
    }

    const {
        data,
        error,
    } = await supabase
        .from("sales")
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
                    name
                )
            )
        `)
        .eq(
            "receipt_number",
            receiptNumber.trim()
        )
        .single();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "Receipt could not be found."
        );
    }

    return buildReceipt(data);
}