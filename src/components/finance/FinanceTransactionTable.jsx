function formatCurrency(value) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getTypeLabel(type) {
  return type === "CASH_IN" ? "Cash In" : "Cash Out";
}

function getTypeClass(type) {
  return type === "CASH_IN"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
}

function getAmountClass(type) {
  return type === "CASH_IN" ? "text-green-600" : "text-red-600";
}

export default function FinanceTransactionTable({
  transactions,
  loading,
  page,
  pageSize,
  totalTransactions,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalTransactions / pageSize));

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-xl font-semibold">Cash Flow</h2>

        <p className="mt-1 text-sm text-gray-500">
          Financial activity for the selected period.
        </p>
      </div>

      <div className="relative min-h-[420px]">
        {transactions.length === 0 && !loading ? (
          <div className="flex min-h-[420px] items-center justify-center px-4 text-center text-gray-500">
            No financial transactions found for this period.
          </div>
        ) : (
          <>
            {/* Desktop / Tablet */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4 font-medium">Description</th>

                    <th className="whitespace-nowrap px-6 py-4 font-medium">
                      Type
                    </th>

                    <th className="whitespace-nowrap px-6 py-4 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr
                      key={`${transaction.source}-${transaction.id}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium">{transaction.description}</p>

                        {transaction.source === "SALE" &&
                          transaction.paymentMethod && (
                            <p className="mt-1 text-xs text-gray-500">
                              Payment: {transaction.paymentMethod}
                            </p>
                          )}

                        {transaction.source === "EXPENSE" &&
                          transaction.notes && (
                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.notes}
                            </p>
                          )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getTypeClass(
                            transaction.type,
                          )}`}
                        >
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>

                      <td
                        className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${getAmountClass(
                          transaction.type,
                        )}`}
                      >
                        {transaction.type === "CASH_IN" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 px-4 pb-4 md:hidden">
              {transactions.map((transaction) => (
                <div
                  key={`${transaction.source}-${transaction.id}`}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium break-words">
                        {transaction.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getTypeClass(
                        transaction.type,
                      )}`}
                    >
                      {getTypeLabel(transaction.type)}
                    </span>
                  </div>

                  {(transaction.source === "SALE" &&
                    transaction.paymentMethod) ||
                  (transaction.source === "EXPENSE" && transaction.notes) ? (
                    <div className="mt-3 border-t pt-3">
                      {transaction.source === "SALE" &&
                        transaction.paymentMethod && (
                          <p className="text-xs text-gray-500">
                            Payment: {transaction.paymentMethod}
                          </p>
                        )}

                      {transaction.source === "EXPENSE" &&
                        transaction.notes && (
                          <p className="text-xs text-gray-500 break-words">
                            {transaction.notes}
                          </p>
                        )}
                    </div>
                  ) : null}

                  <div
                    className={`mt-3 text-right text-lg font-semibold ${getAmountClass(
                      transaction.type,
                    )}`}
                  >
                    {transaction.type === "CASH_IN" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div
              className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
              aria-label="Loading"
            />
          </div>
        )}
      </div>

      {totalTransactions > 0 && (
        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalTransactions)} of{" "}
            {totalTransactions} transactions
          </p>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={loading || page <= 1}
              className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              Previous
            </button>

            <span className="whitespace-nowrap px-1 text-sm text-gray-600 sm:px-2">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={loading || page >= totalPages}
              className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
