"use client";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "READY_FOR_PICKUP",
    label: "Ready for Pickup",
  },
  {
    value: "PICKED_UP",
    label: "Picked Up",
  },
  {
    value: "SHIPPED",
    label: "Shipped",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
  },
];

export default function OrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label
            htmlFor="order-search"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Search orders
          </label>

          <input
            id="order-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Customer, phone, or receipt number..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="order-status"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Fulfillment status
          </label>

          <select
            id="order-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
