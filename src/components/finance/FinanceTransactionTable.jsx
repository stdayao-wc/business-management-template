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

export default function FinanceTransactionTable({
    transactions,
    loading,
}) {
    return (
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
    );
}