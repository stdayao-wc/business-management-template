"use client";

import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/common/Modal";

import {
  createSalePayment,
  getSalePaymentSummary,
  PAYMENT_METHODS,
} from "@/services/salePayments";

function formatCurrency(value) {
  return `₱${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CollectBalanceModal({
  open,
  order,
  user,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [summary, setSummary] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);

  const [amount, setAmount] = useState("");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !order?.id) {
      return;
    }

    async function loadPaymentSummary() {
      try {
        setLoading(true);

        setSummary(null);

        const data = await getSalePaymentSummary(order.id);

        setSummary(data);

        setAmount(data.remainingBalance.toFixed(2));
      } catch (error) {
        console.error("Failed to load payment summary:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPaymentSummary();
  }, [open, order?.id]);

  useEffect(() => {
    if (!open) {
      setSummary(null);

      setPaymentMethod(PAYMENT_METHODS.CASH);

      setAmount("");

      setNotes("");

      setProcessing(false);
    }
  }, [open]);

  const normalizedAmount = Number(amount);

  const remainingBalance = Number(summary?.remainingBalance ?? 0);

  const amountMatchesBalance = useMemo(() => {
    if (!Number.isFinite(normalizedAmount)) {
      return false;
    }

    return Math.abs(normalizedAmount - remainingBalance) < 0.01;
  }, [normalizedAmount, remainingBalance]);

  const canConfirm = Boolean(
    summary &&
    user?.id &&
    !loading &&
    !processing &&
    remainingBalance > 0 &&
    amountMatchesBalance,
  );

  async function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    try {
      setProcessing(true);

      const payment = await createSalePayment({
        saleId: order.id,

        paymentMethod,

        amount: normalizedAmount,

        receivedBy: user.id,

        notes: notes.trim() || null,
      });

      await onSuccess?.({
        payment,
        paymentSummary: {
          ...summary,
          totalPaid: summary.totalPaid + normalizedAmount,

          remainingBalance: 0,
        },
      });
    } finally {
      setProcessing(false);
    }
  }

  if (!order) {
    return null;
  }

  return (
    <Modal open={open} title="Collect Remaining Balance" onClose={onClose}>
      <div className="space-y-6">
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading payment details...
          </div>
        ) : !summary ? (
          <div className="py-8 text-center text-gray-500">
            Unable to load payment details.
          </div>
        ) : (
          <>
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total</span>

                  <span className="font-medium">
                    {formatCurrency(summary.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid</span>

                  <span className="font-medium">
                    {formatCurrency(summary.totalPaid)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Remaining Balance</span>

                  <span className="text-lg font-semibold">
                    {formatCurrency(summary.remainingBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value={PAYMENT_METHODS.CASH}>Cash</option>

                  <option value={PAYMENT_METHODS.E_WALLET}>E-Wallet</option>

                  <option value={PAYMENT_METHODS.ONLINE_BANKING}>
                    Online Banking
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Payment Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border px-3 py-2"
                />

                {!amountMatchesBalance && amount !== "" && (
                  <p className="mt-2 text-sm text-red-600">
                    Payment must equal the remaining balance of{" "}
                    {formatCurrency(remainingBalance)}.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Optional payment notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="rounded-lg border px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {processing ? "Processing..." : "Collect Balance"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
