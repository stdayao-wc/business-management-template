import { supabase } from "@/lib/supabase/client";

const SALE_PAYMENTS_TABLE = "sale_payments";

export const PAYMENT_METHODS = {
    CASH: "Cash",
    E_WALLET: "E-Wallet",
    ONLINE_BANKING: "Online Banking",
};

export async function getSalePayments(saleId) {
    if (!saleId) {
        throw new Error(
            "Sale ID is required."
        );
    }

    const {
        data,
        error,
    } = await supabase
        .from(SALE_PAYMENTS_TABLE)
        .select(`
            id,
            sale_id,
            payment_method,
            amount,
            received_by,
            notes,
            created_at
        `)
        .eq("sale_id", saleId)
        .order("created_at", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getSalePaymentSummary(
    saleId
) {
    if (!saleId) {
        throw new Error(
            "Sale ID is required."
        );
    }

    const [
        saleResult,
        payments,
    ] = await Promise.all([
        supabase
            .from("sales")
            .select(`
                id,
                total,
                is_downpayment
            `)
            .eq("id", saleId)
            .single(),

        getSalePayments(saleId),
    ]);

    if (saleResult.error) {
        throw saleResult.error;
    }

    const sale = saleResult.data;

    const totalAmount = Number(
        sale.total ?? 0
    );

    const totalPaid = payments.reduce(
        (sum, payment) => {
            return (
                sum +
                Number(payment.amount ?? 0)
            );
        },
        0
    );

    const remainingBalance =
        Math.max(
            totalAmount - totalPaid,
            0
        );

    return {
        saleId: sale.id,

        totalAmount,

        totalPaid,

        remainingBalance,

        isDownpayment:
            Boolean(
                sale.is_downpayment
            ),

        payments,
    };
}

export async function createSalePayment({
    saleId,
    paymentMethod,
    amount,
    receivedBy,
    notes = null,
}) {
    if (!saleId) {
        throw new Error(
            "Sale ID is required."
        );
    }

    if (!paymentMethod) {
        throw new Error(
            "Payment method is required."
        );
    }

    if (!receivedBy) {
        throw new Error(
            "User receiving payment is required."
        );
    }

    const normalizedAmount =
        Number(amount);

    if (
        !Number.isFinite(
            normalizedAmount
        ) ||
        normalizedAmount <= 0
    ) {
        throw new Error(
            "Payment amount must be greater than zero."
        );
    }

    const paymentSummary =
        await getSalePaymentSummary(
            saleId
        );

    if (
        paymentSummary.remainingBalance <= 0
    ) {
        throw new Error(
            "This order has already been fully paid."
        );
    }

    if (
        normalizedAmount >
        paymentSummary.remainingBalance
    ) {
        throw new Error(
            `Payment amount cannot exceed the remaining balance of ₱${paymentSummary.remainingBalance.toFixed(
                2
            )}.`
        );
    }

    const {
        data,
        error,
    } = await supabase
        .from(SALE_PAYMENTS_TABLE)
        .insert({
            sale_id: saleId,

            payment_method:
                paymentMethod,

            amount:
                normalizedAmount,

            received_by:
                receivedBy,

            notes:
                notes || null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}