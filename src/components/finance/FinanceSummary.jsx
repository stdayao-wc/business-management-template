function formatCurrency(value) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function FinanceSummary({ totals }) {
  return (
    <div className="grid min-w-0 gap-4 sm:gap-6 md:grid-cols-3">
      <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-gray-500">Cash In</p>

        <p className="mt-3 min-w-0 break-words text-2xl font-bold text-green-600 sm:text-3xl">
          {formatCurrency(totals.cashIn)}
        </p>

        <p className="mt-2 break-words text-sm text-gray-500">
          Money received from sales
        </p>
      </div>

      <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-gray-500">Cash Out</p>

        <p className="mt-3 min-w-0 break-words text-2xl font-bold text-red-600 sm:text-3xl">
          {formatCurrency(totals.cashOut)}
        </p>

        <p className="mt-2 break-words text-sm text-gray-500">
          Recorded business expenses
        </p>
      </div>

      <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>

        <p
          className={`mt-3 min-w-0 break-words text-2xl font-bold sm:text-3xl ${
            totals.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(totals.netCashFlow)}
        </p>

        <p className="mt-2 break-words text-sm text-gray-500">
          Cash In minus Cash Out
        </p>
      </div>
    </div>
  );
}
