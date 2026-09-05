"use client";

import Modal from "@/components/common/Modal";

export default function EmployeeDailySummaryExportModal({
  open,
  onClose,
  onExport,
  loading = false,
}) {
  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Daily Summary">
      <div className="space-y-6">
        <div className="rounded-xl bg-gray-50 p-5">
          <p className="text-sm leading-6 text-gray-600">
            Your cashier session has ended successfully.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Would you like to export your daily summary as a PDF?
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border px-4 py-2 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Not Now
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Preparing PDF..." : "Export PDF"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
