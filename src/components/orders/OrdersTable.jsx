"use client";

function formatCurrency(value) {
  return `₱${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function getCashierName(cashier) {
  if (!cashier) {
    return "-";
  }

  return (
    [cashier.first_name, cashier.last_name].filter(Boolean).join(" ") || "-"
  );
}

function getStatusLabel(status) {
  if (!status) {
    return "-";
  }

  return status.replaceAll("_", " ");
}

function getStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-700";

    case "READY_FOR_PICKUP":
      return "bg-yellow-100 text-yellow-800";

    case "PICKED_UP":
      return "bg-green-100 text-green-800";

    case "SHIPPED":
      return "bg-blue-100 text-blue-800";

    case "DELIVERED":
      return "bg-green-100 text-green-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getAction(order) {
  if (
    order.shipping_method === "PICKUP" &&
    order.fulfillment_status === "PENDING"
  ) {
    return {
      label: "Ready for Pickup",
      action: "ready_for_pickup",
    };
  }

  if (
    order.shipping_method === "PICKUP" &&
    order.fulfillment_status === "READY_FOR_PICKUP"
  ) {
    return {
      label: "Mark Picked Up",
      action: "picked_up",
    };
  }

  if (
    order.shipping_method !== "PICKUP" &&
    order.fulfillment_status === "PENDING"
  ) {
    return {
      label: "Mark Shipped",
      action: "shipped",
    };
  }

  if (
    order.shipping_method !== "PICKUP" &&
    order.fulfillment_status === "SHIPPED"
  ) {
    return {
      label: "Mark Delivered",
      action: "delivered",
    };
  }

  return null;
}

export default function OrdersTable({
  orders,
  loading,
  updatingOrderId,

  page,
  pageSize,
  totalOrders,
  onPageChange,

  onView,
  onMarkReadyForPickup,
  onMarkPickedUp,
  onMarkShipped,
  onMarkDelivered,
  onVoid,
}) {
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center">
        Loading orders...
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="px-6 py-4">Receipt</th>

            <th className="px-6 py-4">Customer</th>

            <th className="px-6 py-4">Shipping</th>

            <th className="px-6 py-4">Total</th>

            <th className="px-6 py-4">Status</th>

            <th className="px-6 py-4">Date</th>

            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const action = getAction(order);

            const updating = updatingOrderId === order.id;

            return (
              <tr
                key={order.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onView(order)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {order.receipt_number}
                  </button>
                </td>

                <td className="px-6 py-4">
                  <div className="font-medium">
                    {order.customer_name || "-"}
                  </div>

                  <div className="text-sm text-gray-500">
                    {order.customer_phone || "-"}
                  </div>
                </td>

                <td className="px-6 py-4">{order.shipping_method || "-"}</td>

                <td className="px-6 py-4 font-medium">
                  {formatCurrency(order.total)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      order.fulfillment_status,
                    )}`}
                  >
                    {getStatusLabel(order.fulfillment_status)}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onView(order)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      View
                    </button>

                    {(order.fulfillment_status === "PENDING" ||
                      order.fulfillment_status === "READY_FOR_PICKUP") && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onVoid(order.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Void"}
                      </button>
                    )}

                    {action?.action === "ready_for_pickup" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onMarkReadyForPickup(order.id)}
                        className="rounded-lg bg-yellow-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {updating ? "Updating..." : action.label}
                      </button>
                    )}

                    {action?.action === "picked_up" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onMarkPickedUp(order.id)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {updating ? "Updating..." : action.label}
                      </button>
                    )}

                    {action?.action === "shipped" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onMarkShipped(order.id)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {updating ? "Updating..." : action.label}
                      </button>
                    )}

                    {action?.action === "delivered" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => onMarkDelivered(order.id)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {updating ? "Updating..." : action.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-sm text-gray-500">
          Showing {totalOrders === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalOrders)} of {totalOrders} orders
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page <= 1}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= totalPages}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
