import { FINANCE_PERIODS } from "@/services/finance";

export default function FinancePeriodFilter({
    period,
    onChange,
}) {
    return (
        <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm">
            <button
                type="button"
                onClick={() =>
                    onChange(FINANCE_PERIODS.WEEK)
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
                    onChange(FINANCE_PERIODS.MONTH)
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
                    onChange(FINANCE_PERIODS.YEAR)
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
    );
}