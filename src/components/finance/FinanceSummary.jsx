function formatCurrency(value) {
    return `₱${Number(value ?? 0).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

export default function FinanceSummary({
    totals,
}) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                    Cash In
                </p>

                <p className="mt-3 text-3xl font-bold text-green-600">
                    {formatCurrency(totals.cashIn)}
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
                    {formatCurrency(totals.cashOut)}
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
    );
}