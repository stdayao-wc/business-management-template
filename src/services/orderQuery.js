import { supabase } from "@/lib/supabase/client";

const SALES_TABLE = "sales";

/**
 * Returns the start and end dates for an order period.
 */
export function getOrderDateRange(period) {
    const now = new Date();

    const startDate = new Date(now);
    const endDate = new Date(now);

    if (period === "DAY") {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    if (period === "WEEK") {
        const day = now.getDay();

        /*
         * Monday is the start of the week.
         *
         * Sunday = 0
         * Monday = 1
         * ...
         */
        const daysSinceMonday =
            day === 0
                ? 6
                : day - 1;

        startDate.setDate(
            now.getDate() - daysSinceMonday
        );

        startDate.setHours(0, 0, 0, 0);

        endDate.setTime(
            startDate.getTime()
        );

        endDate.setDate(
            startDate.getDate() + 6
        );

        endDate.setHours(
            23,
            59,
            59,
            999
        );
    }

    if (period === "MONTH") {
        startDate.setDate(1);

        startDate.setHours(0, 0, 0, 0);

        endDate.setMonth(
            now.getMonth() + 1,
            0
        );

        endDate.setHours(
            23,
            59,
            59,
            999
        );
    }

    return {
        startDate,
        endDate,
    };
}

/**
 * Returns paginated orders within a date range.
 */
export async function getOrdersByDateRange({
    startDate,
    endDate,
    page = 1,
    pageSize = 5,
} = {}) {
    const safePage = Math.max(1, page);

    const safePageSize = Math.max(
        1,
        pageSize
    );

    const from =
        (safePage - 1) * safePageSize;

    const to =
        from + safePageSize - 1;

    let query = supabase
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

    if (startDate) {
        query = query.gte(
            "created_at",
            startDate.toISOString()
        );
    }

    if (endDate) {
        query = query.lte(
            "created_at",
            endDate.toISOString()
        );
    }

    const {
        data,
        count,
        error,
    } = await query;

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