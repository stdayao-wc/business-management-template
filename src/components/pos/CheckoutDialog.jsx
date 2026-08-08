"use client";

import { useMemo, useState, useEffect } from "react";

import Modal from "@/components/common/Modal";

export default function CheckoutDialog({
    open,
    totals,
    onClose,
    onConfirm,
}) {
    const [paymentMethod, setPaymentMethod] =
        useState("Cash");

    const [amountReceived, setAmountReceived] =
        useState(totals.total);

    const [notes, setNotes] = useState("");

    const [processing, setProcessing] = useState(false);

    const [shippingMethod, setShippingMethod] =
        useState("PICKUP");

    const [customerName, setCustomerName] =
        useState("");

    const [customerPhone, setCustomerPhone] =
        useState("");

    const [shippingAddress, setShippingAddress] =
        useState("");

    const changeGiven = useMemo(() => {
        const amount = Number(amountReceived);

        if (Number.isNaN(amount)) {
            return 0;
        }

        return Math.max(amount - totals.total, 0);
    }, [amountReceived, totals.total]);

    async function handleConfirm() {
        if (processing) {
            return;
        }

        setProcessing(true);

        try {
            await onConfirm({
                shippingMethod,
                customerName,
                customerPhone,
                shippingAddress:
                    shippingMethod === "PICKUP"
                        ? ""
                        : shippingAddress,

                paymentMethod,
                amountReceived: Number(amountReceived),
                changeGiven,
                notes,
            });
        } finally {
            setProcessing(false);
        }
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        setShippingMethod("PICKUP");
        setCustomerName("");
        setCustomerPhone("");
        setShippingAddress("");

        setPaymentMethod("Cash");
        setAmountReceived(0);
        setNotes("");
    }, [open, totals.total]);

    return (
        <Modal
            open={open}
            title="Checkout"
            onClose={onClose}
        >
            <div className="space-y-6">

                {/* Totals */}

                <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>
                            ₱{totals.subtotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                            ₱{totals.total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Payment */}

                <div className="space-y-4">

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Payment Method
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="Cash">
                                Cash
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Shipping Method
                        </label>

                        <select
                            value={shippingMethod}
                            onChange={(e) =>
                                setShippingMethod(e.target.value)
                            }
                            disabled={processing}
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="PICKUP">
                                Pickup
                            </option>

                            <option value="LBC">
                                LBC
                            </option>

                            <option value="J&T">
                                J&T
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Customer Name
                        </label>

                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) =>
                                setCustomerName(e.target.value)
                            }
                            disabled={processing}
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Customer Number
                        </label>

                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) =>
                                setCustomerPhone(e.target.value)
                            }
                            disabled={processing}
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Enter customer number"
                        />
                    </div>

                    {shippingMethod !== "PICKUP" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Shipping Address
                            </label>

                            <textarea
                                value={shippingAddress}
                                onChange={(e) =>
                                    setShippingAddress(e.target.value)
                                }
                                disabled={processing}
                                className="w-full rounded-lg border px-3 py-2"
                                rows={3}
                                placeholder="Enter complete shipping address"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Amount Received
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amountReceived}
                            onChange={(e) =>
                                setAmountReceived(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Change
                        </label>

                        <input
                            value={`₱${changeGiven.toFixed(2)}`}
                            readOnly
                            className="w-full rounded-lg border bg-gray-100 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Notes
                        </label>

                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) =>
                                setNotes(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                </div>

                {/* Actions */}

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-lg border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={
                            processing ||
                            Number(amountReceived) <
                            totals.total
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                        Confirm Sale
                    </button>

                </div>

            </div>
        </Modal>
    );
}