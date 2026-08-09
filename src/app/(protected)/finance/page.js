"use client";

import { useEffect, useState } from "react";

import {
    getFinanceTransactions,
    calculateFinanceTotals,
    FINANCE_PERIODS,
    getFinanceDateRange,
} from "@/services/finance";

import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

import DeductableModal from "@/components/finance/DeductableModal";

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
    return new Date(date).toLocaleString(
        "en-PH",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
}

export default function FinancePage() {
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

    async function loadFinance() {
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
                "Failed to load finance:",
                error
            );

            toast.error(
                "Unable to load financial data."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFinance();
    }, [period]);

    const { user } = useAuth();

    const [
        deductableModalOpen,
        setDeductableModalOpen,
    ] = useState(false);

    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <h1 className="text-4xl font-bold">
                        Finance
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Monitor business cash flow
                        and financial activity.
                    </p>
                </div>

                <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                    onClick={() =>
                        setDeductableModalOpen(true)
                    }
                >
                    + Add Deductable
                </button>

            </div>

            {/* Period Filter */}

            <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm">

                <button
                    type="button"
                    onClick={() =>
                        setPeriod(FINANCE_PERIODS.WEEK)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        period === FINANCE_PERIODS.WEEK
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Week
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setPeriod(FINANCE_PERIODS.MONTH)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        period === FINANCE_PERIODS.MONTH
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Month
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setPeriod(FINANCE_PERIODS.YEAR)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        period === FINANCE_PERIODS.YEAR
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Year
                </button>

            </div>

            {/* Summary */}

            <div className="grid gap-6 md:grid-cols-3">

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Cash In
                    </p>

                    <p className="mt-3 text-3xl font-bold text-green-600">
                        {formatCurrency(
                            totals.cashIn
                        )}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        Money received from sales
                    </p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Cash Out
                    </p>

                    <p className="mt-3 text-3xl font-bold text-red-600">
                        {formatCurrency(
                            totals.cashOut
                        )}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        Recorded business expenses
                    </p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Net Cash Flow
                    </p>

                    <p
                        className={`mt-3 text-3xl font-bold ${
                            totals.netCashFlow >= 0
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {formatCurrency(
                            totals.netCashFlow
                        )}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                        Cash In minus Cash Out
                    </p>
                </div>

            </div>

            {/* Transactions */}

            <div className="rounded-xl bg-white shadow-sm">

                <div className="border-b px-6 py-5">
                    <h2 className="text-xl font-semibold">
                        Cash Flow
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Financial activity for the
                        selected period.
                    </p>
                </div>

                {loading ? (
                    <div className="px-6 py-10 text-center text-gray-500">
                        Loading financial data...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-500">
                        No financial transactions
                        found for this period.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b bg-gray-50 text-sm text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">
                                        Date
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Description
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Type
                                    </th>

                                    <th className="px-6 py-4 text-right font-medium">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {transactions.map(
                                    (transaction) => (
                                        <tr
                                            key={`${transaction.source}-${transaction.id}`}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(
                                                    transaction.date
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-medium">
                                                    {
                                                        transaction.description
                                                    }
                                                </p>

                                                {transaction.source ===
                                                    "SALE" &&
                                                    transaction.paymentMethod && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Payment:{" "}
                                                            {
                                                                transaction.paymentMethod
                                                            }
                                                        </p>
                                                    )}

                                                {transaction.source ===
                                                    "EXPENSE" &&
                                                    transaction.notes && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                transaction.notes
                                                            }
                                                        </p>
                                                    )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        transaction.type ===
                                                        "CASH_IN"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {transaction.type ===
                                                    "CASH_IN"
                                                        ? "Cash In"
                                                        : "Cash Out"}
                                                </span>
                                            </td>

                                            <td
                                                className={`px-6 py-4 text-right font-semibold ${
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
<DeductableModal
    open={deductableModalOpen}
    user={user}
    onClose={() =>
        setDeductableModalOpen(false)
    }
    onSuccess={loadFinance}
/>
        </div>
    );
}