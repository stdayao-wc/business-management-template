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
    const printWindow = window.open("", "_blank", "width=400,height=700");

    if (!printWindow) {
      return;
    }

    const sessionRows =
      sessions?.length > 0
        ? sessions
            .map(
              (
                session,
              ) => `               <tr>                 <td>${formatTime(session.time_in)}</td>                 <td>${formatTime(session.time_out)}</td>               </tr>
            `,
            )
            .join("")
        : `           <tr>             <td colspan="2" class="empty">
              No time records available.             </td>           </tr>
        `;

    printWindow.document.write(` <!DOCTYPE html>


<html>
  <head>
    <meta charset="UTF-8" />

    <title>
      Daily Employee Summary
    </title>

    <style>
      @page {
        size: 57mm auto;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: 57mm;
        margin: 0;
        padding: 0;
      }

      body {
        background: #fff;
        color: #000;

        font-family:
          Arial,
          Helvetica,
          sans-serif;

        font-size: 10px;
        line-height: 1.3;
      }

      .receipt {
        width: 57mm;

        margin: 0;
        padding: 4mm 3mm;

        page-break-before: avoid;
      }

      .header {
        text-align: center;

        margin-bottom: 3mm;

        page-break-inside: avoid;
        break-inside: avoid;
      }

      .title {
        margin: 0 0 1mm;

        font-size: 14px;
        font-weight: 700;

        letter-spacing: 0.3px;
      }

      .header-line {
        margin: 0;

        font-size: 9px;
      }

      .divider {
        width: 100%;

        margin: 3mm 0;

        border-top: 1px dashed #000;
      }

      .section {
        margin: 2mm 0;

        page-break-inside: avoid;
        break-inside: avoid;
      }

      .section-title {
        margin: 0 0 1.5mm;

        font-size: 10px;
        font-weight: 700;

        text-transform: uppercase;
      }

      table {
        width: 100%;

        border-collapse: collapse;

        font-size: 9px;
      }

      th,
      td {
        padding: 1.5mm 0;

        border-bottom: 1px solid #000;

        text-align: left;
      }

      th:last-child,
      td:last-child {
        text-align: right;
      }

      th {
        font-weight: 700;
      }

      .empty {
        padding: 2mm 0;

        text-align: center !important;

        border-bottom: 0;
      }

      .products {
        display: flex;

        align-items: center;
        justify-content: space-between;

        padding: 2mm 0;

        border-top: 1px solid #000;
        border-bottom: 1px solid #000;

        page-break-inside: avoid;
        break-inside: avoid;
      }

      .products-label {
        font-size: 9px;
      }

      .products-value {
        font-size: 13px;
        font-weight: 700;
      }

      .payment-row {
        display: flex;

        justify-content: space-between;
        align-items: flex-start;

        width: 100%;

        padding: 1.2mm 0;

        border-bottom: 1px solid #000;

        gap: 3mm;
      }

      .payment-label {
        flex: 1;
      }

      .payment-value {
        flex-shrink: 0;

        text-align: right;

        white-space: nowrap;

        font-weight: 600;
      }

      .footer {
        margin-top: 4mm;

        text-align: center;

        font-size: 8px;

        page-break-inside: avoid;
        break-inside: avoid;
      }
    </style>
  </head>

  <body>
    <div class="receipt">

      <div class="header">
        <div class="title">
          DAILY EMPLOYEE SUMMARY
        </div>

        <p class="header-line">
          ${formatDate(date)}
        </p>

        <p class="header-line">
          Cashier:
          ${cashierName || "Unknown"}
        </p>
      </div>

      <div class="divider"></div>

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

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">
          Sales
        </div>

        <div class="products">
          <span class="products-label">
            Total Products Sold
          </span>

          <span class="products-value">
            ${Number(salesSummary?.totalProductsSold || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">
          Payment Breakdown
        </div>

        <div class="payment-row">
          <span class="payment-label">
            Cash
          </span>

          <span class="payment-value">
            ${formatCurrency(salesSummary?.cashIncome)}
          </span>
        </div>

        <div class="payment-row">
          <span class="payment-label">
            E-Wallet
          </span>

          <span class="payment-value">
            ${formatCurrency(salesSummary?.ewalletIncome)}
          </span>
        </div>

        <div class="payment-row">
          <span class="payment-label">
            Online Banking
          </span>

          <span class="payment-value">
            ${formatCurrency(salesSummary?.onlineBankingIncome)}
          </span>
        </div>
      </div>

      <div class="footer">
        End of daily summary
      </div>

    </div>

    <script>
      window.onload = function () {
        window.focus();

        window.print();

        setTimeout(function () {
          window.close();
        }, 100);
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
