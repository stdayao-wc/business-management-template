"use client";

import Modal from "@/components/common/Modal";

export default function ReceiptModal({ receipt, open, onClose }) {
  if (!receipt) {
    return null;
  }

  const { sale, items, cashierName, paymentSummary } = receipt;

  const totalPaid = Number(paymentSummary?.totalPaid) || 0;

  const remainingBalance = Number(paymentSummary?.remainingBalance) || 0;

  const subtotal = Number(sale.subtotal) || 0;

  const discountAmount = Number(sale.discount_amount) || 0;

  const shippingFee = Number(sale.shipping_fee) || 0;

  const total = Number(sale.total) || 0;

  const amountReceived = Number(sale.amount_received) || 0;

  const changeGiven = Number(sale.change_given) || 0;

  const isDownpayment = Boolean(sale.is_downpayment);

  const downpaymentAmount = Number(sale.downpayment_amount) || 0;

  const isFullyPaid = isDownpayment && remainingBalance <= 0;

  const balanceDue = Math.max(total - downpaymentAmount, 0);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=400,height=600");

    if (!printWindow) {
      return;
    }

    const itemRows = items
      .map(
        (item) => `
                <div class="item">
                    <div class="item-name">
                        ${escapeHtml(item.product?.name || "Unknown Product")}
                    </div>

                    <div class="item-row">
                        <span>
                            ${item.quantity} × ₱${Number(
                              item.unit_price,
                            ).toFixed(2)}
                        </span>

                        <span>
                            ₱${Number(item.line_total).toFixed(2)}
                        </span>
                    </div>
                </div>
            `,
      )
      .join("");

    const customerSection =
      sale.customer_name || sale.customer_phone
        ? `
                <div class="divider"></div>

                <div class="section">
                    <div class="label">
                        CUSTOMER
                    </div>

                    ${
                      sale.customer_name
                        ? `<div>${escapeHtml(sale.customer_name)}</div>`
                        : ""
                    }

                    ${
                      sale.customer_phone
                        ? `<div>${escapeHtml(sale.customer_phone)}</div>`
                        : ""
                    }
                </div>
            `
        : "";

    const discountRow =
      discountAmount > 0
        ? `
                <div class="row">
                    <span>Discount</span>
                    <span>
                        -₱${discountAmount.toFixed(2)}
                    </span>
                </div>
            `
        : "";

    const shippingRow =
      shippingFee > 0
        ? `
                <div class="row">
                    <span>Shipping</span>
                    <span>
                        ₱${shippingFee.toFixed(2)}
                    </span>
                </div>
            `
        : "";

    const paymentSection = isDownpayment
      ? `
            <div class="row">
                <span>Payment</span>
                <span>
                    ${escapeHtml(sale.payment_method || "")}
                </span>
            </div>

            <div class="row">
                <span>Downpayment</span>
                <span>
                    ₱${downpaymentAmount.toFixed(2)}
                </span>
            </div>

            <div class="row emphasis">
                <span>Balance Due</span>
                <span>
                    ₱${balanceDue.toFixed(2)}
                </span>
            </div>
        `
      : `
            <div class="row">
                <span>Payment</span>
                <span>
                    ${escapeHtml(sale.payment_method || "")}
                </span>
            </div>

            <div class="row">
                <span>Received</span>
                <span>
                    ₱${amountReceived.toFixed(2)}
                </span>
            </div>

            <div class="row emphasis">
                <span>Change</span>
                <span>
                    ₱${changeGiven.toFixed(2)}
                </span>
            </div>
        `;

    const fulfillmentSection = sale.shipping_method
      ? `
                <div class="divider"></div>

                <div class="section">
                    <div class="row">
                        <span>Fulfillment</span>
                        <span>
                            ${escapeHtml(sale.shipping_method)}
                        </span>
                    </div>

                    ${
                      sale.shipping_address
                        ? `
                                <div class="address">
                                    ${escapeHtml(sale.shipping_address)}
                                </div>
                            `
                        : ""
                    }
                </div>
            `
      : "";

    printWindow.document.write(`
        <!DOCTYPE html>

        <html>
            <head>
                <meta charset="UTF-8" />

                <title>
                    ${escapeHtml(sale.receipt_number || "Receipt")}
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
                        line-height: 1.35;
                    }

                    .receipt {
                        width: 57mm;
                        margin: 0;
                        padding: 4mm 3mm;
                    }

                    .header {
                        text-align: center;
                        margin-bottom: 3mm;
                    }

                    .title {
                        margin-bottom: 1mm;
                        font-size: 15px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    }

                    .divider {
                        width: 100%;
                        margin: 3mm 0;
                        border-top: 1px dashed #000;
                    }

                    .section {
                        margin: 2mm 0;
                    }

                    .label {
                        margin-bottom: 1mm;
                        font-weight: 700;
                    }

                    .item {
                        margin-bottom: 2.5mm;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    .item-name {
                        font-weight: 600;
                        overflow-wrap: anywhere;
                    }

                    .item-row,
                    .row {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        width: 100%;
                        gap: 3mm;
                    }

                    .item-row span:last-child,
                    .row span:last-child {
                        flex-shrink: 0;
                        text-align: right;
                        white-space: nowrap;
                    }

                    .totals,
                    .payment {
                        display: flex;
                        flex-direction: column;
                        gap: 1.2mm;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    .total {
                        margin-top: 1mm;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .emphasis {
                        font-weight: 700;
                    }

                    .address {
                        margin-top: 1mm;
                        overflow-wrap: anywhere;
                    }

                    .footer {
                        margin-top: 6mm;
                        text-align: center;
                        font-size: 9px;
                    }
                </style>
            </head>

            <body>
                <div class="receipt">

                    <div class="header">
                        <div class="title">
                            RECEIPT
                        </div>

                        <div>
                            ${escapeHtml(sale.receipt_number || "")}
                        </div>

                        <div>
                            ${escapeHtml(formatDate(sale.created_at))}
                        </div>

                        <div>
                            Cashier:
                            ${escapeHtml(cashierName || "Unknown")}
                        </div>
                    </div>

                    ${customerSection}

                    <div class="divider"></div>

                    <div class="items">
                        ${itemRows}
                    </div>

                    <div class="divider"></div>

                    <div class="totals">
                        <div class="row">
                            <span>Subtotal</span>
                            <span>
                                ₱${subtotal.toFixed(2)}
                            </span>
                        </div>

                        ${discountRow}

                        ${shippingRow}

                        <div class="row total">
                            <span>TOTAL</span>
                            <span>
                                ₱${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="payment">
                        ${paymentSection}
                    </div>

                    ${fulfillmentSection}

                    <div class="footer">
                        Thank you for your purchase.
                    </div>

                </div>
            </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleString();
  }

  return (
    <>
      {/* On-screen receipt */}

      <div className="receipt-screen">
        <Modal open={open} title="Sale Receipt" onClose={onClose}>
          <div className="space-y-6">
            {/* Receipt Header */}

            <div className="text-center">
              <p className="text-lg font-semibold">Receipt</p>

              <p className="text-sm text-gray-500">{sale.receipt_number}</p>

              <p className="text-sm text-gray-500">
                {formatDate(sale.created_at)}
              </p>

              <p className="text-sm text-gray-500">
                Cashier: {cashierName || "Unknown"}
              </p>
            </div>

            {/* Customer */}

            {(sale.customer_name || sale.customer_phone) && (
              <div className="space-y-1 border-t pt-4">
                <p className="font-medium">Customer</p>

                {sale.customer_name && (
                  <p className="text-sm">{sale.customer_name}</p>
                )}

                {sale.customer_phone && (
                  <p className="text-sm text-gray-500">{sale.customer_phone}</p>
                )}
              </div>
            )}

            {/* Items */}

            <div className="space-y-3 border-y py-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.product?.name || "Unknown Product"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>

                  <span className="shrink-0 font-medium">
                    ₱{Number(item.line_total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>

                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>

                  <span>
                    -₱
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {shippingFee > 0 && (
                <div className="flex justify-between">
                  <span>Shipping</span>

                  <span>₱{shippingFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Payment</span>

                <span>{sale.payment_method}</span>
              </div>

              {isDownpayment ? (
                <>
                  <div className="flex justify-between font-semibold">
                    <span>Downpayment</span>

                    <span>₱{downpaymentAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>{isFullyPaid ? "Total Paid" : "Balance Due"}</span>

                    <span>
                      ₱{(isFullyPaid ? totalPaid : remainingBalance).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Amount Received</span>

                    <span>₱{amountReceived.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-semibold">
                    <span>Change</span>

                    <span>₱{changeGiven.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Shipping */}

            {sale.shipping_method && (
              <div className="space-y-1 border-t pt-4">
                <div className="flex justify-between">
                  <span>Fulfillment</span>

                  <span>{sale.shipping_method}</span>
                </div>

                {sale.shipping_address && (
                  <p className="text-sm text-gray-500">
                    {sale.shipping_address}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium transition hover:bg-gray-50"
              >
                Print Receipt
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Thermal printer receipt */}

      <div className="receipt-print">
        <div className="receipt-print-inner">
          {/* Header */}

          <div className="receipt-print-header">
            <div className="receipt-print-title">RECEIPT</div>

            <div>{sale.receipt_number}</div>

            <div>{formatDate(sale.created_at)}</div>

            <div>Cashier: {cashierName || "Unknown"}</div>
          </div>

          <div className="receipt-print-divider" />

          {/* Customer */}

          {(sale.customer_name || sale.customer_phone) && (
            <>
              <div className="receipt-print-section">
                <div className="receipt-print-label">CUSTOMER</div>

                {sale.customer_name && <div>{sale.customer_name}</div>}

                {sale.customer_phone && <div>{sale.customer_phone}</div>}
              </div>

              <div className="receipt-print-divider" />
            </>
          )}

          {/* Items */}

          <div className="receipt-print-items">
            {items.map((item) => (
              <div key={item.id} className="receipt-print-item">
                <div className="receipt-print-item-name">
                  {item.product?.name || "Unknown Product"}
                </div>

                <div className="receipt-print-item-row">
                  <span>
                    {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}
                  </span>

                  <span>₱{Number(item.line_total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-print-divider" />

          {/* Totals */}

          <div className="receipt-print-totals">
            <div className="receipt-print-row">
              <span>Subtotal</span>

              <span>₱{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="receipt-print-row">
                <span>Discount</span>

                <span>
                  -₱
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {shippingFee > 0 && (
              <div className="receipt-print-row">
                <span>Shipping</span>

                <span>₱{shippingFee.toFixed(2)}</span>
              </div>
            )}

            <div className="receipt-print-row receipt-print-total">
              <span>TOTAL</span>

              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-print-divider" />

          {/* Payment */}

          <div className="receipt-print-payment">
            <div className="receipt-print-row">
              <span>Payment</span>

              <span>{sale.payment_method}</span>
            </div>

            {isDownpayment ? (
              <>
                <div className="receipt-print-row">
                  <span>Downpayment</span>

                  <span>₱{downpaymentAmount.toFixed(2)}</span>
                </div>

                <div className="receipt-print-row receipt-print-emphasis">
                  <span>{isFullyPaid ? "Total Paid" : "Balance Due"}</span>

                  <span>
                    ₱{(isFullyPaid ? totalPaid : remainingBalance).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="receipt-print-row">
                  <span>Received</span>

                  <span>₱{amountReceived.toFixed(2)}</span>
                </div>

                <div className="receipt-print-row receipt-print-emphasis">
                  <span>Change</span>

                  <span>₱{changeGiven.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Shipping */}

          {sale.shipping_method && (
            <>
              <div className="receipt-print-divider" />

              <div className="receipt-print-section">
                <div className="receipt-print-row">
                  <span>Fulfillment</span>

                  <span>{sale.shipping_method}</span>
                </div>

                {sale.shipping_address && (
                  <div className="receipt-print-address">
                    {sale.shipping_address}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}

          <div className="receipt-print-footer">
            Thank you for your purchase.
          </div>
        </div>
      </div>
    </>
  );
}
