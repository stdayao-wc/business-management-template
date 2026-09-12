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

    /*
     * Get completed sales created during the selected day.
     *
     * These are used for:
     * - Total Products Sold
     * - Gross Revenue
     * - Total Product Cost
     * - Gross Profit
     */
    let salesQuery = supabase
        .from(SALES_TABLE)
        .select(`
            id,
            cashier_id,
            total,
            sale_items (
                quantity,
                cost_price
            )
        `)
        .eq("status", "completed")
        .gte("created_at", startDate)
        .lt("created_at", endDate);

    if (cashierId) {
        salesQuery = salesQuery.eq(
            "cashier_id",
            cashierId
        );
    }

    /*
     * Get payments actually received during the
     * selected day.
     *
     * This is intentionally based on sale_payments.created_at
     * rather than sales.created_at.
     */
    let paymentsQuery = supabase
        .from("sale_payments")
        .select(`
            id,
            sale_id,
            payment_method,
            amount,
            created_at,
            sale:sales!inner (
                id,
                cashier_id,
                status
            )
        `)
        .eq(
            "sale.status",
            "completed"
        )
        .gte(
            "created_at",
            startDate
        )
        .lt(
            "created_at",
            endDate
        );

    if (cashierId) {
        paymentsQuery = paymentsQuery.eq(
            "sale.cashier_id",
            cashierId
        );
    }

    const [
        { data: sales, error: salesError },
        { data: payments, error: paymentsError },
    ] = await Promise.all([
        salesQuery,
        paymentsQuery,
    ]);

    if (salesError) {
        throw salesError;
    }

    if (paymentsError) {
        throw paymentsError;
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

    /*
     * Sales / revenue calculations.
     */
    for (const sale of sales ?? []) {
        const saleTotal =
            Number(sale.total) || 0;

        summary.grossRevenue += saleTotal;

        for (const item of sale.sale_items ?? []) {
            const quantity =
                Number(item.quantity) || 0;

            const costPrice =
                Number(item.cost_price) || 0;

            summary.totalProductsSold +=
                quantity;

            summary.totalCost +=
                quantity * costPrice;
        }
    }

    /*
     * Actual cash received calculations.
     *
     * Do NOT use sale.total here.
     */
    for (const payment of payments ?? []) {
        const amount =
            Number(payment.amount) || 0;

        switch (payment.payment_method) {
            case "Cash":
                summary.cashIncome += amount;
                break;

            case "E-Wallet":
                summary.ewalletIncome += amount;
                break;

            case "Online Banking":
                summary.onlineBankingIncome +=
                    amount;
                break;
        }
    }

    summary.grossProfit =
        summary.grossRevenue -
        summary.totalCost;

    return summary;
}