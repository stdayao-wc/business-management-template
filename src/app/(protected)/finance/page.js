"use client";

import { useEffect } from "react";

import {
    getFinanceTransactions,
    calculateFinanceTotals,
} from "@/services/finance";

export default function FinancePage() {
    useEffect(() => {
        async function testFinance() {
            try {
                const transactions =
                    await getFinanceTransactions();

                console.log(
                    "FINANCE TRANSACTIONS:",
                    transactions
                );

                const totals =
                    calculateFinanceTotals(
                        transactions
                    );

                console.log(
                    "FINANCE TOTALS:",
                    totals
                );
            } catch (error) {
                console.error(
                    "FINANCE TEST FAILED:",
                    error
                );
            }
        }

        testFinance();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">
                Finance
            </h1>

            <p className="mt-2 text-gray-500">
                Finance service test.
                Check the browser console.
            </p>
        </div>
    );
}