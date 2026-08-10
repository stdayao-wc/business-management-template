"use client";

import { useEffect, useState } from "react";

import {
    getFinanceTransactions,
    getFinanceTransactionCount,
    getFinanceTotals,
    FINANCE_PERIODS,
    getFinanceDateRange,
} from "@/services/finance";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import FinanceHeader from "@/components/finance/FinanceHeader";
import FinancePeriodFilter from "@/components/finance/FinancePeriodFilter";
import FinanceSummary from "@/components/finance/FinanceSummary";
import FinanceTransactionTable from "@/components/finance/FinanceTransactionTable";
import DeductableModal from "@/components/finance/DeductableModal";

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

    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);

    const [totalTransactions, setTotalTransactions] =
        useState(0);

    const [deductableModalOpen, setDeductableModalOpen] =
        useState(false);

    const { user } = useAuth();

    async function loadFinance() {
        try {
            setLoading(true);

            const {
                startDate,
                endDate,
            } = getFinanceDateRange(period);

            const [
                transactionData,
                transactionCount,
                financeTotals,
            ] = await Promise.all([
                getFinanceTransactions({
                    startDate,
                    endDate,
                    page,
                    pageSize,
                }),

                getFinanceTransactionCount({
                    startDate,
                    endDate,
                }),

                getFinanceTotals({
                    startDate,
                    endDate,
                }),
            ]);

            setTransactions(transactionData);
            setTotalTransactions(
                transactionCount
            );
            setTotals(financeTotals);
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
    }, [period, page]);

    useEffect(() => {
        setPage(1);
    }, [period]);

    function handlePageChange(nextPage) {
        if (nextPage < 1) {
            return;
        }

        const totalPages = Math.max(
            1,
            Math.ceil(
                totalTransactions / pageSize
            )
        );

        if (nextPage > totalPages) {
            return;
        }

        setPage(nextPage);
    }

    return (
        <div className="space-y-8">
            <FinanceHeader
                onAddDeductable={() =>
                    setDeductableModalOpen(true)
                }
            />

            <FinancePeriodFilter
                period={period}
                onChange={setPeriod}
            />

            <FinanceSummary
                totals={totals}
            />

            <FinanceTransactionTable
                transactions={transactions}
                loading={loading}
                page={page}
                pageSize={pageSize}
                totalTransactions={totalTransactions}
                onPageChange={handlePageChange}
            />

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