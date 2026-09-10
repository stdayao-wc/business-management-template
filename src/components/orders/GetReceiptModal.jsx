"use client";

import { useEffect, useState } from "react";

export default function GetReceiptModal({
open,
loading = false,
onClose,
onGetReceipt,
}) {
const [receiptNumber, setReceiptNumber] =
useState("");


useEffect(() => {
    if (open) {
        setReceiptNumber("");
    }
}, [open]);

if (!open) {
    return null;
}

function handleSubmit(event) {
    event.preventDefault();

    const value =
        receiptNumber.trim();

    if (!value || loading) {
        return;
    }

    onGetReceipt(value);
}

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Get Receipt
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="text-2xl leading-none text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                    ×
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5"
            >
                <div>
                    <label
                        htmlFor="receipt-number"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Receipt Number
                    </label>

                    <input
                        id="receipt-number"
                        type="text"
                        value={receiptNumber}
                        onChange={(event) =>
                            setReceiptNumber(
                                event.target.value
                            )
                        }
                        placeholder="Enter receipt number"
                        autoFocus
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !receiptNumber.trim()
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Getting Receipt..."
                            : "Get Receipt"}
                    </button>
                </div>
            </form>
        </div>
    </div>
);


}
