"use client";

import Modal from "@/components/common/Modal";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value) || 0);
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EmployeeDailySummaryModal({ summary, open, onClose }) {
  if (!summary) {
    return null;
  }

  const { cashierName, date, sessions, salesSummary } = summary;

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=800,height=900");

    if (!printWindow) {
      return;
    }

    const sessionRows =
      sessions?.length > 0
        ? sessions
            .map(
              (session) => `
            <tr>
              <td>${formatTime(session.time_in)}</td>

              <td>${formatTime(session.time_out)}</td>
            </tr>
          `,
            )
            .join("")
        : `
        <tr>
          <td
            colspan="2"
            style="text-align: center;"
          >
            No time records available.
          </td>
        </tr>
      `;

    printWindow.document.write(`
  <!DOCTYPE html>

  <html>
    <head>
      <title>
        Daily Employee Summary
      </title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 40px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color: #111827;
        }

        .container {
          max-width: 700px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header h1 {
          margin: 0;
          font-size: 24px;
        }

        .header p {
          margin: 6px 0 0;
          color: #6b7280;
        }

        .section {
          margin-top: 28px;
        }

        .section-title {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom:
            1px solid #d1d5db;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
        }

        .info-row {
          display: flex;
          justify-content:
            space-between;
          gap: 20px;
          padding: 12px 0;
          border-bottom:
            1px solid #e5e7eb;
        }

        .label {
          color: #6b7280;
        }

        .value {
          font-weight: bold;
          text-align: right;
        }

        .products-sold {
          padding: 20px;
          border:
            1px solid #d1d5db;
          border-radius: 8px;
        }

        .products-sold-label {
          color: #6b7280;
          font-size: 14px;
        }

        .products-sold-value {
          margin-top: 6px;
          font-size: 28px;
          font-weight: bold;
        }

        table {
          width: 100%;
          border-collapse:
            collapse;
        }

        th,
        td {
          padding: 12px;
          border:
            1px solid #d1d5db;
          text-align: left;
        }

        th {
          background: #f3f4f6;
          font-size: 14px;
        }

        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">

        <div class="header">
          <h1>
            DAILY EMPLOYEE SUMMARY
          </h1>

          <p>
            ${formatDate(date)}
          </p>

          <p>
            Cashier:
            ${cashierName || "Unknown"}
          </p>
        </div>

        <div class="section">
          <div class="section-title">
            Time Records
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  Time In
                </th>

                <th>
                  Time Out
                </th>
              </tr>
            </thead>

            <tbody>
              ${sessionRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="products-sold">
            <div class="products-sold-label">
              Total Products Sold
            </div>

            <div class="products-sold-value">
              ${Number(salesSummary?.totalProductsSold).toLocaleString()}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            Payment Breakdown
          </div>

          <div class="info-row">
            <span class="label">
              Cash
            </span>

            <span class="value">
              ${formatCurrency(salesSummary?.cashIncome)}
            </span>
          </div>

          <div class="info-row">
            <span class="label">
              E-Wallet
            </span>

            <span class="value">
              ${formatCurrency(salesSummary?.ewalletIncome)}
            </span>
          </div>

          <div class="info-row">
            <span class="label">
              Online Banking
            </span>

            <span class="value">
              ${formatCurrency(salesSummary?.onlineBankingIncome)}
            </span>
          </div>
        </div>

      </div>

      <script>
        window.onload = function () {
          window.focus();

          window.print();
        };
      </script>
    </body>
  </html>
`);

    printWindow.document.close();
  }

  return (
    <Modal open={open} title="Daily Employee Summary" onClose={onClose}>
      {" "}
      <div className="space-y-6">
        {/* Summary Header */}

        <div className="text-center">
          <p className="text-lg font-semibold">Daily Employee Summary</p>

          <p className="text-sm text-gray-500">{formatDate(date)}</p>

          <p className="mt-2 text-sm text-gray-500">
            Cashier: {cashierName || "Unknown"}
          </p>
        </div>

        {/* Time Records */}

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Time Records
          </h3>

          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-2 border-b bg-gray-50 px-4 py-3 text-sm font-semibold">
              <span>Time In</span>

              <span>Time Out</span>
            </div>

            {sessions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No time records available.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="grid grid-cols-2 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <span>{formatTime(session.time_in)}</span>

                  <span>{formatTime(session.time_out)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Products Sold */}

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Products Sold</p>

          <p className="mt-1 text-3xl font-bold">
            {Number(salesSummary.totalProductsSold).toLocaleString()}
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
                {formatCurrency(salesSummary.cashIncome)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="font-medium">E-Wallet</span>

              <span className="font-semibold">
                {formatCurrency(salesSummary.ewalletIncome)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="font-medium">Online Banking</span>

              <span className="font-semibold">
                {formatCurrency(salesSummary.onlineBankingIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}

        <button
          type="button"
          onClick={handlePrint}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium transition hover:bg-gray-50"
        >
          Print / Save as PDF
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
