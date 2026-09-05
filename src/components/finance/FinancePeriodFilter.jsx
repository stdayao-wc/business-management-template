import { FINANCE_PERIODS } from "@/services/finance";

function formatDateForInput(date) {
  const localDate = new Date(date);

  const year = localDate.getFullYear();

  const month = String(localDate.getMonth() + 1).padStart(2, "0");

  const day = String(localDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthForInput(date) {
  const localDate = new Date(date);

  const year = localDate.getFullYear();

  const month = String(localDate.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export default function FinancePeriodFilter({
  period,
  selectedDate,
  onChange,
  onDateChange,
}) {
  function getAvailableYears() {
    const currentYear = new Date().getFullYear();

    const startYear = currentYear - 10;

    const years = [];

    for (let year = currentYear; year >= startYear; year--) {
      years.push(year);
    }

    return years;
  }

  function handleDateChange(value) {
    if (!value) {
      return;
    }

    onDateChange(new Date(`${value}T00:00:00`));
  }

  function handleMonthChange(value) {
    if (!value) {
      return;
    }

    onDateChange(new Date(`${value}-01T00:00:00`));
  }

  function handleYearChange(value) {
    if (!value) {
      return;
    }

    onDateChange(new Date(Number(value), 0, 1));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(FINANCE_PERIODS.DAY)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            period === FINANCE_PERIODS.DAY
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Day
        </button>

        <button
          type="button"
          onClick={() => onChange(FINANCE_PERIODS.WEEK)}
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
          onClick={() => onChange(FINANCE_PERIODS.MONTH)}
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
          onClick={() => onChange(FINANCE_PERIODS.YEAR)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            period === FINANCE_PERIODS.YEAR
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Year
        </button>
      </div>

      {period === FINANCE_PERIODS.DAY && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label
            htmlFor="finance-date"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Date
          </label>

          <input
            id="finance-date"
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={(event) => handleDateChange(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </div>
      )}

      {period === FINANCE_PERIODS.MONTH && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label
            htmlFor="finance-month"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Month
          </label>

          <input
            id="finance-month"
            type="month"
            value={formatMonthForInput(selectedDate)}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </div>
      )}

      {period === FINANCE_PERIODS.YEAR && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label
            htmlFor="finance-year"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Year
          </label>

          <select
            id="finance-year"
            value={new Date(selectedDate).getFullYear()}
            onChange={(event) => handleYearChange(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
            {getAvailableYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
