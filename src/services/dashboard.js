import { supabase } from "@/lib/supabase/client";

const PRODUCTS_TABLE = "products";
const SALES_TABLE = "sales";

function getStartOfToday() {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date.toISOString();
}

function getStartOfYear() {
    const date = new Date(
        new Date().getFullYear(),
        0,
        1
    );

    return date.toISOString();
}

function getEndOfYear() {
    const date = new Date(
        new Date().getFullYear() + 1,
        0,
        1
    );

    return date.toISOString();
}

export async function getDashboardStats() {
    const today = getStartOfToday();

    const [
        productsResult,
        ordersTodayResult,
        revenueResult,
    ] = await Promise.all([
        supabase
            .from(PRODUCTS_TABLE)
            .select("*", {
                count: "exact",
                head: true,
            }),

        supabase
            .from(SALES_TABLE)
            .select("*", {
                count: "exact",
                head: true,
            })
            .gte("created_at", today),

        supabase
            .from(SALES_TABLE)
            .select("total")
            .gte("created_at", today),
    ]);

    if (productsResult.error) {
        throw productsResult.error;
    }

    if (ordersTodayResult.error) {
        throw ordersTodayResult.error;
    }

    if (revenueResult.error) {
        throw revenueResult.error;
    }

    const revenue = (revenueResult.data ?? []).reduce(
        (total, sale) =>
            total + Number(sale.total ?? 0),
        0
    );

    return {
        products: productsResult.count ?? 0,
        ordersToday: ordersTodayResult.count ?? 0,
        revenue,
    };
}

export async function getMonthlySales() {
    const startOfYear = getStartOfYear();
    const endOfYear = getEndOfYear();

    const { data, error } = await supabase
        .from(SALES_TABLE)
        .select("created_at, total")
        .gte("created_at", startOfYear)
        .lt("created_at", endOfYear)
        .order("created_at", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    const monthlySales = Array.from(
        { length: 12 },
        (_, index) => ({
            month: new Date(
                new Date().getFullYear(),
                index,
                1
            ).toLocaleDateString("en-US", {
                month: "short",
            }),
            sales: 0,
        })
    );

    for (const sale of data ?? []) {
        const date = new Date(sale.created_at);
        const month = date.getMonth();

        monthlySales[month].sales += Number(
            sale.total ?? 0
        );
    }

    return monthlySales;
}

export async function getRecentActivity() {
    const { data, error } = await supabase
        .from(SALES_TABLE)
        .select(
            "id, receipt_number, total, created_at, fulfillment_status"
        )
        .order("created_at", {
            ascending: false,
        })
        .limit(5);

    if (error) {
        throw error;
    }

    return (data ?? []).map((sale) => ({
        id: sale.id,
        title: `Sale #${sale.receipt_number}`,
        description: `₱${Number(
            sale.total ?? 0
        ).toLocaleString("en-PH")}`,
        date: sale.created_at,
        type: "Sales",
        fulfillmentStatus:
            sale.fulfillment_status,
    }));
}