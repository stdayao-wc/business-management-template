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
 *
 * Sales are treated as Cash In.
 */
async function getSales() {
    const { data, error } = await supabase
        .from(SALES_TABLE)
        .select(`
            id,
            receipt_number,
            total,
            payment_method,
            created_at,
            status
        `)
        .eq("status", "completed")
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Get expenses for Finance.
 *
 * Expenses are treated as Cash Out.
 */
async function getExpenses() {
    const { data, error } = await supabase
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
        `)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Convert a sale into the common Finance transaction format.
 */
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

/**
 * Convert an expense into the common Finance transaction format.
 */
function normalizeExpense(expense) {
    let description = expense.description;

    if (
        expense.expense_type ===
        EXPENSE_TYPES.EMPLOYEE_SALARY &&
        expense.employee_name
    ) {
        description = `Employee Salary - ${expense.employee_name}`;
    }

    if (
        expense.expense_type ===
        EXPENSE_TYPES.BUY_FROM_SUPPLIER &&
        expense.supplier_name
    ) {
        description = `Supplier Purchase - ${expense.supplier_name}`;
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
 * Get all Finance transactions.
 *
 * Combines Sales and Expenses into one
 * normalized transaction list.
 */
export async function getFinanceTransactions() {
    const [sales, expenses] = await Promise.all([
        getSales(),
        getExpenses(),
    ]);

    const transactions = [
        ...sales.map(normalizeSale),
        ...expenses.map(normalizeExpense),
    ];

    transactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    return transactions;
}

/**
 * Calculate Finance totals from normalized transactions.
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