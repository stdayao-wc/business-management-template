"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import {
  getDailySalesCashiers,
  getDailySalesSummary,
} from "@/services/dailySalesSummary";

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value) || 0);
}

export default function DailySalesSummaryModal({ open, onClose }) {
  const [date, setDate] = useState(getTodayDate());

  const [cashiers, setCashiers] = useState([]);

  const [cashierId, setCashierId] = useState("");

  const [summary, setSummary] = useState(null);

  const [loadingCashiers, setLoadingCashiers] = useState(false);

  const [loadingSummary, setLoadingSummary] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDate(getTodayDate());
    setCashierId("");
    setSummary(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || !date) {
      return;
    }

    async function loadCashiers() {
      try {
        setLoadingCashiers(true);
        setError(null);

        const data = await getDailySalesCashiers({
          date,
        });

        setCashiers(data);

        /*
         * Keep the current cashier selection only
         * if that cashier actually has sales on the
         * newly selected date.
         */
        setCashierId((current) => {
          if (current && data.some((cashier) => cashier.id === current)) {
            return current;
          }

          return "";
        });
      } catch (err) {
        console.error("Failed to load daily sales cashiers:", err);

        setCashiers([]);
        setCashierId("");
        setError(err?.message || "Unable to load cashiers.");
      } finally {
        setLoadingCashiers(false);
      }
    }

    loadCashiers();
  }, [open, date]);

  useEffect(() => {
    if (!open || !date) {
      return;
    }

    async function loadSummary() {
      try {
        setLoadingSummary(true);
        setError(null);

        const data = await getDailySalesSummary({
          date,
          cashierId: cashierId || null,
        });

        setSummary(data);
      } catch (err) {
        console.error("Failed to load daily sales summary:", err);

        setSummary(null);
        setError(err?.message || "Unable to load daily sales summary.");
      } finally {
        setLoadingSummary(false);
      }
    }

    loadSummary();
  }, [open, date, cashierId]);

  const selectedCashier = cashiers.find((cashier) => cashier.id === cashierId);

  return (
    <Modal open={open} onClose={onClose} title="Daily Sales Summary">
      <div className="space-y-6">
        {/* Filters */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={loadingSummary}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Cashier</label>

            <select
              value={cashierId}
              onChange={(event) => setCashierId(event.target.value)}
              disabled={loadingCashiers || loadingSummary}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">All Cashiers</option>

              {cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name || "Unnamed Cashier"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}

        {loadingSummary ? (
          <div className="rounded-lg border p-8 text-center text-sm text-gray-500">
            Loading sales summary...
          </div>
        ) : summary ? (
          <>
            <div className="rounded-xl bg-gray-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Cashier</p>

                  <p className="font-medium">
                    {selectedCashier?.name || "All Cashiers"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date</p>

                  <p className="font-medium">
                    {new Date(`${summary.date}T00:00:00`).toLocaleDateString(
                      "en-PH",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Sold */}

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Total Products Sold</p>

              <p className="mt-1 text-3xl font-bold">
                {summary.totalProductsSold.toLocaleString()}
              </p>
            </div>

            {/* Payment Breakdown */}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Payment Breakdown
              </h3>

              <div className="divide-y rounded-xl border">
                <div className="flex items-center justify-between p-4">
                  <span className="font-medium">Cash</span>

                  <span className="font-semibold">
                    {formatCurrency(summary.cashIncome)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="font-medium">E-Wallet</span>

                  <span className="font-semibold">
                    {formatCurrency(summary.ewalletIncome)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="font-medium">Online Banking</span>

                  <span className="font-semibold">
                    {formatCurrency(summary.onlineBankingIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}

            <div className="rounded-xl bg-gray-50 p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gross Revenue</span>

                  <span className="text-lg font-semibold">
                    {formatCurrency(summary.grossRevenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Product Cost</span>

                  <span className="text-lg font-semibold">
                    {formatCurrency(summary.totalCost)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Gross Profit</span>

                    <span className="text-2xl font-bold">
                      {formatCurrency(summary.grossProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border p-8 text-center text-sm text-gray-500">
            No sales data available.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loadingSummary}
            className="rounded-lg border px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
