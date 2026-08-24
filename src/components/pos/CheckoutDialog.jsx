"use client";

import { useMemo, useState, useEffect } from "react";

import Modal from "@/components/common/Modal";

export default function CheckoutDialog({ open, totals, onClose, onConfirm }) {
  const [paymentType, setPaymentType] = useState("FULL_PAYMENT");

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [discountAmount, setDiscountAmount] = useState(0);

  const [shippingFee, setShippingFee] = useState(0);

  const [amountReceived, setAmountReceived] = useState(totals.total);

  const [notes, setNotes] = useState("");

  const [processing, setProcessing] = useState(false);

  const [shippingMethod, setShippingMethod] = useState("PICKUP");

  const [customerName, setCustomerName] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");

  const checkoutTotal = useMemo(() => {
    const subtotal = Number(totals.subtotal) || 0;

    const discount = Number(discountAmount) || 0;

    const shipping = Number(shippingFee) || 0;

    return Math.max(subtotal - discount + shipping, 0);
  }, [totals.subtotal, discountAmount, shippingFee]);

  const normalizedAmountReceived = Number(amountReceived);

  const changeGiven = useMemo(() => {
    if (paymentType === "DOWNPAYMENT") {
      return 0;
    }

    if (!Number.isFinite(normalizedAmountReceived)) {
      return 0;
    }

    return Math.max(normalizedAmountReceived - checkoutTotal, 0);
  }, [paymentType, normalizedAmountReceived, checkoutTotal]);

  const remainingBalance = useMemo(() => {
    if (paymentType !== "DOWNPAYMENT") {
      return 0;
    }

    if (!Number.isFinite(normalizedAmountReceived)) {
      return checkoutTotal;
    }

    return Math.max(checkoutTotal - normalizedAmountReceived, 0);
  }, [paymentType, normalizedAmountReceived, checkoutTotal]);

  const canConfirm = useMemo(() => {
    if (processing) {
      return false;
    }

    if (!Number.isFinite(normalizedAmountReceived)) {
      return false;
    }

    if (paymentType === "DOWNPAYMENT") {
      return (
        normalizedAmountReceived > 0 && normalizedAmountReceived < checkoutTotal
      );
    }

    return normalizedAmountReceived >= checkoutTotal;
  }, [processing, normalizedAmountReceived, paymentType, checkoutTotal]);

  async function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    setProcessing(true);

    try {
      await onConfirm({
        shippingMethod,
        customerName,
        customerPhone,

        shippingAddress: shippingMethod === "PICKUP" ? "" : shippingAddress,

        paymentType,
        paymentMethod,

        discountAmount: Number(discountAmount) || 0,

        shippingFee: Number(shippingFee) || 0,

        amountReceived: normalizedAmountReceived,

        isDownpayment: paymentType === "DOWNPAYMENT",

        downpaymentAmount:
          paymentType === "DOWNPAYMENT" ? normalizedAmountReceived : 0,

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

    setPaymentType("FULL_PAYMENT");

    setShippingMethod("PICKUP");

    setCustomerName("");

    setCustomerPhone("");

    setShippingAddress("");

    setPaymentMethod("Cash");

    setDiscountAmount(0);

    setShippingFee(0);

    setAmountReceived(totals.total);

    setNotes("");
  }, [open, totals.total]);

  return (
    <Modal open={open} title="Checkout" onClose={onClose}>
      <div className="space-y-6">
        {/* Totals */}

        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex justify-between">
            <span>Subtotal</span>

            <span>₱{Number(totals.subtotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>

            <span>
              -₱
              {(Number(discountAmount) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Shipping Fee</span>

            <span>₱{(Number(shippingFee) || 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-2 text-lg font-semibold">
            <span>Total</span>

            <span>₱{checkoutTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}

        <div className="space-y-4">
          {/* Payment Type */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Payment Type
            </label>

            <select
              value={paymentType}
              onChange={(e) => {
                const type = e.target.value;

                setPaymentType(type);

                if (type === "FULL_PAYMENT") {
                  setAmountReceived(checkoutTotal);
                } else {
                  setAmountReceived(0);
                }
              }}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="FULL_PAYMENT">Full Payment</option>

              <option value="DOWNPAYMENT">Downpayment</option>
            </select>
          </div>

          {/* Payment Method */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* Discount */}

          <div>
            <label className="mb-1 block text-sm font-medium">Discount</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter discount amount"
            />
          </div>

          {/* Shipping Fee */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Shipping Fee
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              disabled={processing || shippingMethod === "PICKUP"}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter shipping fee"
            />
          </div>

          {/* Shipping Method */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Method</label>

            <select
              value={shippingMethod}
              onChange={(e) => {
                const method = e.target.value;

                setShippingMethod(method);

                if (method === "PICKUP") {
                  setShippingFee(0);
                }
              }}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="PICKUP">Pickup</option>

              <option value="LBC">LBC</option>

              <option value="J&T">J&T</option>
            </select>
          </div>

          {/* Customer Name */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name</label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter customer name"
            />
          </div>

          {/* Customer Number */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Number</label>

            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Enter customer number"
            />
          </div>

          {/* Shipping Address */}

          {shippingMethod !== "PICKUP" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Shipping Address</label>

              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={processing}
                className="w-full rounded-lg border px-3 py-2"
                rows={3}
                placeholder="Enter complete shipping address"
              />
            </div>
          )}

          {/* Amount Received */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              {paymentType === "DOWNPAYMENT"
                ? "Downpayment Amount"
                : "Amount Received"}
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              disabled={processing}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {/* Remaining Balance */}

          {paymentType === "DOWNPAYMENT" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Remaining Balance
              </label>

              <input
                value={`₱${remainingBalance.toFixed(2)}`}
                readOnly
                className="w-full rounded-lg border bg-gray-100 px-3 py-2"
              />
            </div>
          )}

          {/* Change */}

          {paymentType === "FULL_PAYMENT" && (
            <div>
              <label className="mb-1 block text-sm font-medium">Change</label>

              <input
                value={`₱${changeGiven.toFixed(2)}`}
                readOnly
                className="w-full rounded-lg border bg-gray-100 px-3 py-2"
              />
            </div>
          )}

          {/* Notes */}

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={processing}
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
            disabled={!canConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {processing
              ? "Processing..."
              : paymentType === "DOWNPAYMENT"
                ? "Confirm Downpayment"
                : "Confirm Sale"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
