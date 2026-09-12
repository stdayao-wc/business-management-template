"use client";

import OrdersTable from "@/components/orders/OrdersTable";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import CollectBalanceModal from "@/components/orders/CollectBalanceModal";
import OrderPeriodFilter from "@/components/orders/OrderPeriodFilter";
import GetReceiptModal from "@/components/orders/GetReceiptModal";
import ReceiptModal from "@/components/pos/ReceiptModal";
import OrderFilters from "@/components/orders/OrderFilters";

import useOrdersPage from "@/hooks/useOrdersPage";

export default function OrdersPage() {
const {
user,


    orders,
    loading,

    search,
    setSearch,

    status,
    setStatus,

    selectedOrder,
    setSelectedOrder,

    getReceiptOpen,
    setGetReceiptOpen,

    receipt,
    setReceipt,

    receiptLoading,

    updatingOrderId,

    page,
    pageSize,
    totalOrders,

    period,
    setPeriod,

    balanceOrder,

    handlePageChange,
    handleStatusUpdate,
    handleVoidOrder,

    handleViewReceipt,
    handleGetReceipt,

    handleBalancePaymentSuccess,
    handleCloseBalanceModal,
} = useOrdersPage();

return (
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold">
                Orders
            </h1>

            <p className="mt-2 text-gray-500">
                View sales and manage order
                fulfillment.
            </p>
        </div>

<OrderPeriodFilter
    period={period}
    onChange={setPeriod}
/>

<OrderFilters
    search={search}
    onSearchChange={setSearch}
    status={status}
    onStatusChange={setStatus}
/>

        <button
            type="button"
            onClick={() =>
                setGetReceiptOpen(true)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
            Get Receipt
        </button>

        <OrdersTable
            orders={orders}
            loading={loading}
            updatingOrderId={
                updatingOrderId
            }
            page={page}
            pageSize={pageSize}
            totalOrders={
                totalOrders
            }
            onPageChange={
                handlePageChange
            }
            onView={
                setSelectedOrder
            }
            onViewReceipt={
                handleViewReceipt
            }
            onMarkReadyForPickup={(
                orderId
            ) =>
                handleStatusUpdate(
                    orderId,
                    "ready_for_pickup"
                )
            }
            onMarkPickedUp={(
                orderId
            ) =>
                handleStatusUpdate(
                    orderId,
                    "picked_up"
                )
            }
            onMarkShipped={(
                orderId
            ) =>
                handleStatusUpdate(
                    orderId,
                    "shipped"
                )
            }
            onVoid={
                handleVoidOrder
            }
        />

        <OrderDetailsModal
            open={
                selectedOrder !== null
            }
            order={
                selectedOrder
            }
            onClose={() =>
                setSelectedOrder(null)
            }
        />

        <ReceiptModal
            open={receipt !== null}
            receipt={receipt}
            onClose={() =>
                setReceipt(null)
            }
        />

        <GetReceiptModal
            open={getReceiptOpen}
            loading={receiptLoading}
            onClose={() =>
                setGetReceiptOpen(false)
            }
            onGetReceipt={
                handleGetReceipt
            }
        />

        <CollectBalanceModal
            open={
                balanceOrder !== null
            }
            order={
                balanceOrder
            }
            user={
                user
            }
            onClose={
                handleCloseBalanceModal
            }
            onSuccess={
                handleBalancePaymentSuccess
            }
        />
    </div>
);


}
