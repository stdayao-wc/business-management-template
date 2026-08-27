/**
 * Returns today's collected sales grouped by payment method.
 *
 * Uses amount_received because the POS supports downpayments.
 *
 * Voided sales are excluded.
 */
import { supabase } from "@/lib/supabase/client";

const SALES_TABLE = "sales";

export async function getTodayPaymentSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from(SALES_TABLE)
        .select(
            "payment_method, amount_received, change_given, status, created_at"
        )
        .gte(
            "created_at",
            startOfDay.toISOString()
        )
        .lte(
            "created_at",
            endOfDay.toISOString()
        )
        .neq("status", "voided");

    if (error) {
        throw error;
    }

    const summary = {
        cash: 0,
        eWallet: 0,
        onlineBanking: 0,
    };

    for (const sale of data ?? []) {
        const amountReceived =
            Number(sale.amount_received) || 0;

        const changeGiven =
            Number(sale.change_given) || 0;

        const amountCollected =
            sale.payment_method === "Cash"
                ? Math.max(
                      amountReceived -
                          changeGiven,
                      0
                  )
                : amountReceived;

        switch (sale.payment_method) {
            case "Cash":
                summary.cash += amountCollected;
                break;

            case "E-Wallet":
                summary.eWallet += amountCollected;
                break;

            case "Online Banking":
                summary.onlineBanking +=
                    amountCollected;
                break;
        }
    }

    return summary;
}