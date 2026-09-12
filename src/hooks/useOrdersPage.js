"use client";

import { useEffect, useState } from "react";

import {
markOrderReadyForPickup,
markOrderPickedUp,
markOrderShipped,
voidOrder,
} from "@/services/orderFulfillment";

import {
getOrdersByDateRange,
getOrderDateRange,
} from "@/services/orderQuery";

import {
getReceiptById,
getReceiptByNumber,
} from "@/services/receipts";

import { ORDER_PERIODS } from "@/constants/orderPeriods";

import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

export default function useOrdersPage() {
const { user } = useAuth();


const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);

const [selectedOrder, setSelectedOrder] =
    useState(null);

const [getReceiptOpen, setGetReceiptOpen] =
    useState(false);

const [receipt, setReceipt] =
    useState(null);

const [receiptLoading, setReceiptLoading] =
    useState(false);

const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

const [page, setPage] = useState(1);
const [pageSize] = useState(5);

const [totalOrders, setTotalOrders] =
    useState(0);

const [period, setPeriod] = useState(
    ORDER_PERIODS.MONTH
);

const [search, setSearch] =
    useState("");

const [status, setStatus] =
    useState("");

const [debouncedSearch, setDebouncedSearch] =
    useState("");

const [balanceOrder, setBalanceOrder] =
    useState(null);

const [
    pendingFulfillmentAction,
    setPendingFulfillmentAction,
] = useState(null);

async function loadOrders(
    pageNumber = 1,
    searchValue = search,
    statusValue = status
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
                search: searchValue,
                status: statusValue,
                page: pageNumber,
                pageSize,
            });

        setOrders(result.data);
        setTotalOrders(result.total);

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
    const timeout = setTimeout(() => {
        setDebouncedSearch(
            search.trim()
        );
    }, 400);

    return () => {
        clearTimeout(timeout);
    };
}, [search]);

useEffect(() => {
    loadOrders(1);
    setPage(1);
}, [
    period,
    debouncedSearch,
    status,
]);

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
                "Unable to update order."
        );
    } finally {
        setUpdatingOrderId(null);
    }
}

async function handleViewReceipt(orderId) {
    if (
        !orderId ||
        receiptLoading
    ) {
        return;
    }

    try {
        setReceiptLoading(true);

        const data =
            await getReceiptById(
                orderId
            );

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

async function handleGetReceipt(
    receiptNumber
) {
    if (
        !receiptNumber ||
        receiptLoading
    ) {
        return;
    }

    try {
        setReceiptLoading(true);

        const data =
            await getReceiptByNumber(
                receiptNumber
            );

        setReceipt(data);
        setGetReceiptOpen(false);
    } catch (error) {
        console.error(
            "Failed to get receipt:",
            error
        );

        toast.error(
            error?.message ||
                "Receipt could not be found."
        );
    } finally {
        setReceiptLoading(false);
    }
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
    setPendingFulfillmentAction(null);

    await performStatusUpdate(
        orderId,
        action
    );
}

function handleCloseBalanceModal() {
    setBalanceOrder(null);
    setPendingFulfillmentAction(null);
}

return {
    user,

    orders,
    loading,

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

    search,
    setSearch,

    status,
    setStatus,

    balanceOrder,

    handlePageChange,
    handleStatusUpdate,
    handleVoidOrder,

    handleViewReceipt,
    handleGetReceipt,

    handleBalancePaymentSuccess,
    handleCloseBalanceModal,
};


}
