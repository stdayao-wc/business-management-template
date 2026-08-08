"use client";

import Modal from "@/components/common/Modal";

export default function ReceiptModal({
    receipt,
    open,
    onClose,
}) {
    if (!receipt) {
        return null;
    }

    const {
        sale,
        items,
        cashierName,
    } = receipt;

    return (
        <Modal
            open={open}
            title="Sale Receipt"
            onClose={onClose}
        >
            <div className="space-y-6">

                {/* Receipt Header */}

                <div className="text-center">
                    <p className="text-lg font-semibold">
                        Receipt
                    </p>

                    <p className="text-sm text-gray-500">
                        {sale.receipt_number}
                    </p>

                    <p className="text-sm text-gray-500">
                        {new Date(
                            sale.created_at
                        ).toLocaleString()}
                    </p>

                    <p className="text-sm text-gray-500">
                        Cashier: {cashierName || "Unknown"}
                    </p>
                </div>

                {/* Items */}

                <div className="space-y-3 border-y py-4">
                    {items.map((item) => {
                        const lineTotal =
                            item.product.selling_price *
                            item.quantity;

                        return (
                            <div
                                key={item.product.id}
                                className="flex justify-between gap-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.product.name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {item.quantity} × ₱
                                        {item.product.selling_price.toFixed(
                                            2
                                        )}
                                    </p>
                                </div>

                                <span className="font-medium">
                                    ₱{lineTotal.toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Totals */}

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>

                        <span>
                            ₱{Number(
                                sale.subtotal
                            ).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>

                        <span>
                            ₱{Number(
                                sale.total
                            ).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Payment */}

                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                        <span>Payment</span>

                        <span>
                            {sale.payment_method}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>Amount Received</span>

                        <span>
                            ₱{Number(
                                sale.amount_received
                            ).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between font-semibold">
                        <span>Change</span>

                        <span>
                            ₱{Number(
                                sale.change_given
                            ).toFixed(2)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                    Done
                </button>

            </div>
        </Modal>
    );
}