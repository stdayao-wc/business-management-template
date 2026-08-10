import { supabase } from "@/lib/supabase/client";

const SALES_TABLE = "sales";
const EXPENSES_TABLE = "expenses";

export const EXPENSE_TYPES = {
    BUY_FROM_SUPPLIER: "BUY_FROM_SUPPLIER",
    EMPLOYEE_SALARY: "EMPLOYEE_SALARY",
    OTHER: "OTHER",
};

/**
 * Get completed sales for Finance.
 */
async function getSales({
    startDate = null,
    endDate = null,
} = {}) {
    let query = supabase
        .from(SALES_TABLE)
        .select(`
            id,
            receipt_number,
            total,
            payment_method,
            created_at,
            status
        `)
        .eq("status", "completed");

    if (startDate) {
        query = query.gte(
            "created_at",
            startDate
        );
    }

    if (endDate) {
        query = query.lt(
            "created_at",
            endDate
        );
    }

    const { data, error } = await query.order(
        "created_at",
        {
            ascending: false,
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Get expenses for Finance.
 */
async function getExpenses({
    startDate = null,
    endDate = null,
} = {}) {
    let query = supabase
        .from(EXPENSES_TABLE)
        .select(`
            id,
            expense_type,
            description,
            amount,
            employee_name,
            supplier_name,
            notes,
            created_by,
            created_at
        `);

    if (startDate) {
        query = query.gte(
            "created_at",
            startDate
        );
    }

    if (endDate) {
        query = query.lt(
            "created_at",
            endDate
        );
    }

    const { data, error } = await query.order(
        "created_at",
        {
            ascending: false,
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

function normalizeSale(sale) {
    return {
        id: sale.id,
        date: sale.created_at,
        description: `Sale ${sale.receipt_number}`,
        type: "CASH_IN",
        amount: Number(sale.total),
        source: "SALE",
        reference: sale.receipt_number,
        paymentMethod: sale.payment_method,
    };
}

function normalizeExpense(expense) {
    let description = expense.description;

    if (
        expense.expense_type ===
            EXPENSE_TYPES.EMPLOYEE_SALARY &&
        expense.employee_name
    ) {
        description =
            `Employee Salary - ${expense.employee_name}`;
    }

    if (
        expense.expense_type ===
            EXPENSE_TYPES.BUY_FROM_SUPPLIER &&
        expense.supplier_name
    ) {
        description =
            `Supplier Purchase - ${expense.supplier_name}`;
    }

    return {
        id: expense.id,
        date: expense.created_at,
        description,
        type: "CASH_OUT",
        amount: Number(expense.amount),
        source: "EXPENSE",
        reference: expense.id,
        expenseType: expense.expense_type,
        employeeName: expense.employee_name,
        supplierName: expense.supplier_name,
        notes: expense.notes,
    };
}

/**
 * Get Finance transactions for a date range.
 *
 * endDate is exclusive.
 */
export async function getFinanceTransactions({
    startDate = null,
    endDate = null,
    page = 1,
    pageSize = 5,
} = {}) {
    const { data, error } = await supabase.rpc(
        "get_finance_transactions",
        {
            p_start_date: startDate,
            p_end_date: endDate,
            p_page: page,
            p_page_size: pageSize,
        }
    );

    if (error) {
        throw error;
    }

    return data ?? [];
}

/**
 * Calculate Finance totals.
 */
export function calculateFinanceTotals(
    transactions
) {
    let cashIn = 0;
    let cashOut = 0;

    for (const transaction of transactions) {
        if (transaction.type === "CASH_IN") {
            cashIn += transaction.amount;
        }

        if (transaction.type === "CASH_OUT") {
            cashOut += transaction.amount;
        }
    }

    return {
        cashIn,
        cashOut,
        netCashFlow: cashIn - cashOut,
    };
}

/**
 * Create a financial expense.
 */
export async function createExpense({
    expenseType,
    description,
    amount,
    employeeName = null,
    supplierName = null,
    notes = null,
    createdBy,
}) {
    if (!createdBy) {
        throw new Error(
            "User creating the expense is required."
        );
    }

    if (!expenseType) {
        throw new Error(
            "Expense type is required."
        );
    }

    if (!description?.trim()) {
        throw new Error(
            "Description is required."
        );
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new Error(
            "Amount must be greater than zero."
        );
    }

    const { data, error } = await supabase
        .from(EXPENSES_TABLE)
        .insert({
            expense_type: expenseType,
            description: description.trim(),
            amount,
            employee_name:
                employeeName?.trim() || null,
            supplier_name:
                supplierName?.trim() || null,
            notes: notes?.trim() || null,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export const FINANCE_PERIODS = {
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
};

export function getFinanceDateRange(period) {
    const now = new Date();

    if (period === FINANCE_PERIODS.WEEK) {
        const start = new Date(now);

        const day = start.getDay();

        const daysFromMonday =
            day === 0 ? 6 : day - 1;

        start.setDate(
            start.getDate() - daysFromMonday
        );

        start.setHours(0, 0, 0, 0);

        return {
            startDate: start.toISOString(),
            endDate: now.toISOString(),
        };
    }

    if (period === FINANCE_PERIODS.MONTH) {
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        return {
            startDate: start.toISOString(),
            endDate: now.toISOString(),
        };
    }

    if (period === FINANCE_PERIODS.YEAR) {
        const start = new Date(
            now.getFullYear(),
            0,
            1
        );

        return {
            startDate: start.toISOString(),
            endDate: now.toISOString(),
        };
    }

    return {
        startDate: null,
        endDate: null,
    };
}

export function calculateFinanceReport(
    transactions
) {
    const totals =
        calculateFinanceTotals(transactions);

    let salesCount = 0;
    let expenseCount = 0;

    const cashInBySource = {};
    const cashOutByType = {};

    for (const transaction of transactions) {
        if (transaction.type === "CASH_IN") {
            salesCount++;

            cashInBySource[
                transaction.source
            ] =
                (cashInBySource[
                    transaction.source
                ] ?? 0) +
                transaction.amount;
        }

        if (transaction.type === "CASH_OUT") {
            expenseCount++;

            cashOutByType[
                transaction.expenseType
            ] =
                (cashOutByType[
                    transaction.expenseType
                ] ?? 0) +
                transaction.amount;
        }
    }

    return {
        ...totals,

        salesCount,
        expenseCount,

        cashInBySource,
        cashOutByType,
    };
}


export async function getFinanceTransactionCount({
    startDate = null,
    endDate = null,
} = {}) {
    const { data, error } = await supabase.rpc(
        "get_finance_transaction_count",
        {
            p_start_date: startDate,
            p_end_date: endDate,
        }
    );

    if (error) {
        throw error;
    }

    return Number(data ?? 0);
}

export async function getFinanceTotals({
    startDate = null,
    endDate = null,
} = {}) {
    const { data, error } =
        await supabase.rpc(
            "get_finance_totals",
            {
                p_start_date: startDate,
                p_end_date: endDate,
            }
        );

    if (error) {
        throw error;
    }

    const result = data?.[0];

    return {
        cashIn: Number(
            result?.cash_in ?? 0
        ),
        cashOut: Number(
            result?.cash_out ?? 0
        ),
        netCashFlow: Number(
            result?.net_cash_flow ?? 0
        ),
    };
}