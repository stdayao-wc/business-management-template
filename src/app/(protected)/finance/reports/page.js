"use client";

import { useEffect, useState } from "react";

import {
    getFinanceTransactions,
    calculateFinanceTotals,
    FINANCE_PERIODS,
    getFinanceDateRange,
} from "@/services/finance";

import { toast } from "sonner";

function formatCurrency(value) {
    return `₱${Number(value ?? 0).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(
        "en-PH",
        {
            dateStyle: "medium",
        }
    );
}

export default function FinanceReportsPage() {
    const [period, setPeriod] = useState(
        FINANCE_PERIODS.MONTH
    );

    const [transactions, setTransactions] =
        useState([]);

    const [totals, setTotals] = useState({
        cashIn: 0,
        cashOut: 0,
        netCashFlow: 0,
    });

    const [loading, setLoading] =
        useState(true);

    async function loadReport() {
        try {
            setLoading(true);

            const {
                startDate,
                endDate,
            } = getFinanceDateRange(period);

            const data =
                await getFinanceTransactions({
                    startDate,
                    endDate,
                });

            setTransactions(data);

            setTotals(
                calculateFinanceTotals(data)
            );
        } catch (error) {
            console.error(
                "Failed to load financial report:",
                error
            );

            toast.error(
                "Unable to load financial report."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReport();
    }, [period]);

    const sales = transactions.filter(
        (transaction) =>
            transaction.source === "SALE"
    );

    const expenses = transactions.filter(
        (transaction) =>
            transaction.source === "EXPENSE"
    );

    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        Financial Report
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Financial activity for the
                        selected period.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
                >
                    Print Report
                </button>
            </div>

            {/* Period Filter */}

            <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm">
                <button
                    type="button"
                    onClick={() =>
                        setPeriod(
                            FINANCE_PERIODS.WEEK
                        )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        period ===
                        FINANCE_PERIODS.WEEK
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Week
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setPeriod(
                            FINANCE_PERIODS.MONTH
                        )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        period ===
                        FINANCE_PERIODS.MONTH
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Month
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setPeriod(
                            FINANCE_PERIODS.YEAR
                        )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        period ===
                        FINANCE_PERIODS.YEAR
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Year
                </button>
            </div>

            {/* Report */}

            {loading ? (
                <div className="rounded-xl bg-white px-6 py-12 text-center text-gray-500 shadow-sm">
                    Generating financial report...
                </div>
            ) : (
                <div className="space-y-8 rounded-xl bg-white p-8 shadow-sm">

                    {/* Report Title */}

                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-bold">
                            Business Financial Report
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Period:{" "}
                            {period ===
                            FINANCE_PERIODS.WEEK
                                ? "This Week"
                                : period ===
                                  FINANCE_PERIODS.MONTH
                                ? "This Month"
                                : "This Year"}
                        </p>
                    </div>

                    {/* Summary */}

                    <div className="grid gap-6 md:grid-cols-3">

                        <div>
                            <p className="text-sm text-gray-500">
                                Cash In
                            </p>

                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {formatCurrency(
                                    totals.cashIn
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Cash Out
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {formatCurrency(
                                    totals.cashOut
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Net Cash Flow
                            </p>

                            <p
                                className={`mt-2 text-2xl font-bold ${
                                    totals.netCashFlow >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {formatCurrency(
                                    totals.netCashFlow
                                )}
                            </p>
                        </div>

                    </div>

                    {/* Activity Summary */}

                    <div className="grid gap-6 border-y py-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Sales
                            </p>

                            <p className="mt-1 text-xl font-semibold">
                                {sales.length}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatCurrency(
                                    totals.cashIn
                                )}{" "}
                                received
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Expenses
                            </p>

                            <p className="mt-1 text-xl font-semibold">
                                {expenses.length}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatCurrency(
                                    totals.cashOut
                                )}{" "}
                                spent
                            </p>
                        </div>

                    </div>

                    {/* Transactions */}

                    <div>
                        <h3 className="mb-4 text-lg font-semibold">
                            Transactions
                        </h3>

                        {transactions.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">
                                No transactions found
                                for this period.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b text-sm text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Date
                                            </th>

                                            <th className="px-4 py-3">
                                                Description
                                            </th>

                                            <th className="px-4 py-3">
                                                Type
                                            </th>

                                            <th className="px-4 py-3 text-right">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {transactions.map(
                                            (
                                                transaction
                                            ) => (
                                                <tr
                                                    key={`${transaction.source}-${transaction.id}`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {formatDate(
                                                            transaction.date
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            transaction.description
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {transaction.type ===
                                                        "CASH_IN"
                                                            ? "Cash In"
                                                            : "Cash Out"}
                                                    </td>

                                                    <td
                                                        className={`px-4 py-3 text-right font-semibold ${
                                                            transaction.type ===
                                                            "CASH_IN"
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {transaction.type ===
                                                        "CASH_IN"
                                                            ? "+"
                                                            : "-"}
                                                        {formatCurrency(
                                                            transaction.amount
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}