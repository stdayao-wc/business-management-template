import { ORDER_PERIODS } from "@/constants/orderPeriods";

const PERIOD_OPTIONS = [
    {
        value: ORDER_PERIODS.DAY,
        label: "Today",
    },
    {
        value: ORDER_PERIODS.WEEK,
        label: "This Week",
    },
    {
        value: ORDER_PERIODS.MONTH,
        label: "This Month",
    },
];

export default function OrderPeriodFilter({
    period,
    onChange,
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map(
                (option) => {
                    const isActive =
                        period === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                onChange(
                                    option.value
                                )
                            }
                            className={
                                isActive
                                    ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                    : "rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            }
                        >
                            {option.label}
                        </button>
                    );
                }
            )}
        </div>
    );
}