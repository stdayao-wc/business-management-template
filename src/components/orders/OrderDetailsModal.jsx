"use client";

import Modal from "@/components/common/Modal";

function formatCurrency(value) {
    return `₱${Number(value ?? 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
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

    return [
        cashier.first_name,
        cashier.last_name,
    ]
        .filter(Boolean)
        .join(" ") || "-";
}

function getStatusLabel(status) {
    if (!status) {
        return "-";
    }

    return status.replaceAll("_", " ");
}

export default function OrderDetailsModal({
    open,
    order,
    onClose,
}) {
    if (!order) {
        return null;
    }

    return (
        <Modal
            open={open}
            title="Order Details"
            onClose={onClose}
        >
            <div className="space-y-6">
                {/* Order header */}

                <div className="rounded-lg border p-4">
                    <div className="flex justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                Receipt
                            </p>

                            <p className="font-semibold">
                                {
                                    order.receipt_number
                                }
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <p className="font-semibold">
                                {getStatusLabel(
                                    order.fulfillment_status
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer */}

                <section>
                    <h3 className="mb-3 font-semibold">
                        Customer
                    </h3>

                    <div className="rounded-lg border p-4 space-y-2">
                        <div>
                            <span className="text-sm text-gray-500">
                                Name
                            </span>

                            <p>
                                {order.customer_name ||
                                    "-"}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Phone
                            </span>

                            <p>
                                {order.customer_phone ||
                                    "-"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Shipping */}

                <section>
                    <h3 className="mb-3 font-semibold">
                        Fulfillment
                    </h3>

                    <div className="rounded-lg border p-4 space-y-2">
                        <div>
                            <span className="text-sm text-gray-500">
                                Method
                            </span>

                            <p>
                                {order.shipping_method ||
                                    "-"}
                            </p>
                        </div>

                        {order.shipping_method !==
                            "PICKUP" && (
                            <div>
                                <span className="text-sm text-gray-500">
                                    Address
                                </span>

                                <p>
                                    {order.shipping_address ||
                                        "-"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Items */}

                <section>
                    <h3 className="mb-3 font-semibold">
                        Items
                    </h3>

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-gray-500">
                                    <th className="px-4 py-3">
                                        Product
                                    </th>

                                    <th className="px-4 py-3">
                                        SKU
                                    </th>

                                    <th className="px-4 py-3">
                                        Qty
                                    </th>

                                    <th className="px-4 py-3">
                                        Price
                                    </th>

                                    <th className="px-4 py-3">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {(
                                    order.sale_items ||
                                    []
                                ).map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            {item.product
                                                ?.name ||
                                                "-"}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {item.product
                                                ?.sku ||
                                                "-"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                item.quantity
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatCurrency(
                                                item.unit_price
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatCurrency(
                                                item.line_total
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Payment */}

                <section>
                    <h3 className="mb-3 font-semibold">
                        Payment
                    </h3>

                    <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                                {formatCurrency(
                                    order.subtotal
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>
                                {formatCurrency(
                                    order.total
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Payment</span>
                            <span>
                                {order.payment_method ||
                                    "-"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Amount Received</span>
                            <span>
                                {formatCurrency(
                                    order.amount_received
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Change</span>
                            <span>
                                {formatCurrency(
                                    order.change_given
                                )}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Cashier */}

                <section>
                    <h3 className="mb-3 font-semibold">
                        Sale Information
                    </h3>

                    <div className="rounded-lg border p-4 space-y-2">
                        <div>
                            <span className="text-sm text-gray-500">
                                Cashier
                            </span>

                            <p>
                                {getCashierName(
                                    order.cashier
                                )}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                Created
                            </span>

                            <p>
                                {formatDate(
                                    order.created_at
                                )}
                            </p>
                        </div>

                        {order.notes && (
                            <div>
                                <span className="text-sm text-gray-500">
                                    Notes
                                </span>

                                <p>
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Modal>
    );
}