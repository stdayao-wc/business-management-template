"use client";

import { useEffect, useState } from "react";

import {
    markOrderReadyForPickup,
    markOrderPickedUp,
    markOrderShipped,
    voidOrder,
} from "@/services/orders";

import OrdersTable from "@/components/orders/OrdersTable";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import CollectBalanceModal from "@/components/orders/CollectBalanceModal";

import { toast } from "sonner";

import {
    getOrdersByDateRange,
    getOrderDateRange,
} from "@/services/orderQuery";

import {
    ORDER_PERIODS,
} from "@/constants/orderPeriods";

import OrderPeriodFilter from "@/components/orders/OrderPeriodFilter";

import { useAuth } from "@/context/AuthContext";

import ReceiptModal from "@/components/pos/ReceiptModal";

import {
    getReceiptById,
} from "@/services/receipts";

export default function OrdersPage() {
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [receipt, setReceipt] =
        useState(null);

    const [receiptLoading, setReceiptLoading] =
        useState(false);
        

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);

    const [
        totalOrders,
        setTotalOrders,
    ] = useState(0);

    const [period, setPeriod] = useState(
        ORDER_PERIODS.MONTH
    );

    const [
        balanceOrder,
        setBalanceOrder,
    ] = useState(null);

    const [
        pendingFulfillmentAction,
        setPendingFulfillmentAction,
    ] = useState(null);

    function handlePageChange(nextPage) {
        if (nextPage < 1) {
            return;
        }

        const totalPages = Math.max(
            1,
            Math.ceil(
                totalOrders / pageSize
            )
        );

        if (nextPage > totalPages) {
            return;
        }

        setPage(nextPage);

        loadOrders(nextPage);
    }

    async function loadOrders(
        pageNumber = 1
    ) {
        try {
            setLoading(true);

            const {
                startDate,
                endDate,
            } = getOrderDateRange(period);

            const result =
                await getOrdersByDateRange({
                    startDate,
                    endDate,
                    page: pageNumber,
                    pageSize,
                });

            setOrders(result.data);

            setTotalOrders(
                result.total
            );

            return result;
        } catch (error) {
            console.error(
                "Failed to load orders:",
                error
            );

            toast.error(
                "Unable to load orders."
            );

            return null;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders(1);
    }, [period]);

    useEffect(() => {
        setPage(1);
    }, [period]);

    async function performStatusUpdate(
        orderId,
        action
    ) {
        if (updatingOrderId) {
            return;
        }

        if (!user?.id) {
            toast.error(
                "Unable to determine the current user."
            );

            return;
        }

        try {
            setUpdatingOrderId(orderId);

            if (
                action ===
                "ready_for_pickup"
            ) {
                await markOrderReadyForPickup(
                    orderId,
                    user.id
                );
            }

            if (
                action ===
                "picked_up"
            ) {
                await markOrderPickedUp(
                    orderId,
                    user.id
                );
            }

            if (
                action ===
                "shipped"
            ) {
                await markOrderShipped(
                    orderId,
                    user.id
                );
            }

            await loadOrders(page);

            if (
                selectedOrder?.id ===
                orderId
            ) {
                setSelectedOrder(
                    (current) => {
                        if (!current) {
                            return current;
                        }

                        return {
                            ...current,

                            fulfillment_status:
                                action ===
                                "ready_for_pickup"
                                    ? "READY_FOR_PICKUP"
                                    : action ===
                                        "picked_up"
                                      ? "PICKED_UP"
                                      : "SHIPPED",
                        };
                    }
                );
            }

            toast.success(
                "Order status updated."
            );
        } catch (error) {
            console.error(
                "Failed to update order:",
                error
            );

            toast.error(
                error?.message ||
                    "Unable to update order."
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    async function handleViewReceipt(orderId) {
        if (!orderId || receiptLoading) {
            return;
        }

        try {
            setReceiptLoading(true);

            const data =
                await getReceiptById(orderId);

            setReceipt(data);
        } catch (error) {
            console.error(
                "Failed to load receipt:",
                error
            );

            toast.error(
                error?.message ||
                    "Unable to load receipt."
            );
        } finally {
            setReceiptLoading(false);
        }
    }

    function handleStatusUpdate(
        orderId,
        action
    ) {
        const order = orders.find(
            (item) =>
                item.id === orderId
        );

        if (!order) {
            toast.error(
                "Order could not be found."
            );

            return;
        }

        const requiresFinalPayment =
            order.is_downpayment &&
            (
                action === "picked_up" ||
                action === "shipped"
            );

        if (requiresFinalPayment) {
            setBalanceOrder(order);

            setPendingFulfillmentAction(
                action
            );

            return;
        }

        performStatusUpdate(
            orderId,
            action
        );
    }

    async function handleBalancePaymentSuccess() {
        if (
            !balanceOrder?.id ||
            !pendingFulfillmentAction
        ) {
            return;
        }

        const orderId =
            balanceOrder.id;

        const action =
            pendingFulfillmentAction;

        setBalanceOrder(null);

        setPendingFulfillmentAction(
            null
        );

        await performStatusUpdate(
            orderId,
            action
        );
    }

    function handleCloseBalanceModal() {
        setBalanceOrder(null);

        setPendingFulfillmentAction(
            null
        );
    }

    async function handleVoidOrder(orderId) {
        if (updatingOrderId) {
            return;
        }

        if (!user?.id) {
            toast.error(
                "Unable to determine the current user."
            );

            return;
        }

        try {
            setUpdatingOrderId(orderId);

            await voidOrder(
                orderId,
                user.id
            );

            await loadOrders(page);

            if (
                selectedOrder?.id ===
                orderId
            ) {
                setSelectedOrder(null);
            }

            toast.success(
                "Order voided successfully."
            );
        } catch (error) {
            console.error(
                "Failed to void order:",
                error
            );

            toast.error(
                error?.message ||
                    "Unable to void order."
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

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
                onClose={() => setReceipt(null)}
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