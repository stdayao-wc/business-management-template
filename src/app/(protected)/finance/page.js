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