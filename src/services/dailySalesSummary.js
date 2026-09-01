import { supabase } from "@/lib/supabase/client";

const SALES_TABLE = "sales";
const PROFILES_TABLE = "profiles";

/**
 * Get the start and end timestamps for a selected calendar date.
 *
 * The end is exclusive so we query:
 *
 * >= start of day
 * <  start of following day
 */
function getDateRange(date) {
    if (!date) {
        throw new Error("Date is required.");
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(
        startOfNextDay.getDate() + 1
    );

    return {
        startDate: startOfDay.toISOString(),
        endDate: startOfNextDay.toISOString(),
    };
}

/**
 * Get cashiers who have completed sales on a specific date.
 *
 * Only cashiers who actually made a completed sale
 * during the selected date are returned.
 */
export async function getDailySalesCashiers({
    date,
}) {
    const {
        startDate,
        endDate,
    } = getDateRange(date);

    const { data: sales, error: salesError } =
        await supabase
            .from(SALES_TABLE)
            .select("cashier_id")
            .eq("status", "completed")
            .gte("created_at", startDate)
            .lt("created_at", endDate);

    if (salesError) {
        throw salesError;
    }

    const cashierIds = [
        ...new Set(
            (sales ?? [])
                .map((sale) => sale.cashier_id)
                .filter(Boolean)
        ),
    ];

    if (cashierIds.length === 0) {
        return [];
    }

    const { data: profiles, error: profilesError } =
        await supabase
            .from(PROFILES_TABLE)
            .select(
                "id, first_name, last_name"
            )
            .in("id", cashierIds);

    if (profilesError) {
        throw profilesError;
    }

    return (profiles ?? [])
        .map((profile) => ({
            id: profile.id,
            name: [
                profile.first_name,
                profile.last_name,
            ]
                .filter(Boolean)
                .join(" ")
                .trim(),
        }))
        .sort((a, b) =>
            a.name.localeCompare(b.name)
        );
}

/**
 * Get the daily sales summary.
 *
 * cashierId:
 * - null = all cashiers
 * - UUID = selected cashier
 *
 * Only completed sales are included.
 */
export async function getDailySalesSummary({
    date,
    cashierId = null,
}) {
    const {
        startDate,
        endDate,
    } = getDateRange(date);

    let query = supabase
        .from(SALES_TABLE)
        .select(`
            id,
            cashier_id,
            total,
            payment_method,
            sale_items (
                quantity,
                cost_price
            )
        `)
        .eq("status", "completed")
        .gte("created_at", startDate)
        .lt("created_at", endDate);

    if (cashierId) {
        query = query.eq(
            "cashier_id",
            cashierId
        );
    }

    const { data: sales, error } =
        await query;

    if (error) {
        throw error;
    }

    const summary = {
        date,
        cashierId,

        totalProductsSold: 0,

        cashIncome: 0,
        ewalletIncome: 0,
        onlineBankingIncome: 0,

        grossRevenue: 0,
        totalCost: 0,
        grossProfit: 0,
    };

    for (const sale of sales ?? []) {
        const saleTotal =
            Number(sale.total) || 0;

        summary.grossRevenue += saleTotal;

        switch (sale.payment_method) {
            case "Cash":
                summary.cashIncome += saleTotal;
                break;

            case "E-Wallet":
                summary.ewalletIncome += saleTotal;
                break;

            case "Online Banking":
                summary.onlineBankingIncome +=
                    saleTotal;
                break;
        }

        for (const item of sale.sale_items ?? []) {
            const quantity =
                Number(item.quantity) || 0;

            const costPrice =
                Number(item.cost_price) || 0;

            summary.totalProductsSold += quantity;

            summary.totalCost +=
                quantity * costPrice;
        }
    }

    summary.grossProfit =
        summary.grossRevenue -
        summary.totalCost;

    return summary;
}