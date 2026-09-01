export default function FinanceHeader({
  onAddDeductable,
  onViewDailySalesSummary,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-bold">Finance</h1>

        <p className="mt-2 text-gray-500">
          Monitor business cash flow and financial activity.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
          onClick={onViewDailySalesSummary}
        >
          Daily Sales Summary
        </button>

        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          onClick={onAddDeductable}
        >
          + Add Deductable
        </button>
      </div>
    </div>
  );
}
