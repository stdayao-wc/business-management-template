"use client";

import { useEffect, useState } from "react";

import {
    getOrders,
    markOrderReadyForPickup,
    markOrderPickedUp,
    markOrderShipped,
    voidOrder,
} from "@/services/orders";

import OrdersTable from "@/components/orders/OrdersTable";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";

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

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalOrders, setTotalOrders] = useState(0);

    const [period, setPeriod] = useState(
        ORDER_PERIODS.MONTH
    );

    function handlePageChange(nextPage) {
        if (nextPage < 1) {
            return;
        }

        const totalPages = Math.max(
            1,
            Math.ceil(totalOrders / pageSize)
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
        loadOrders(1);
    }, [period]);

    useEffect(() => {
        setPage(1);
    }, [period]);

    async function handleStatusUpdate(
        orderId,
        action
    ) {
        if (updatingOrderId) {
            return;
        }

        try {
            setUpdatingOrderId(orderId);
            if (action === "ready_for_pickup") {
                await markOrderReadyForPickup(orderId);
            }

            if (action === "picked_up") {
                await markOrderPickedUp(
                    orderId
                );
            }

            if (action === "shipped") {
                await markOrderShipped(
                    orderId
                );
            }

            // if (action === "delivered") {
            //     await markOrderDelivered(
            //         orderId
            //     );
            // }

            await loadOrders(page);

            if (selectedOrder?.id === orderId) {
                setSelectedOrder((current) => {
                    if (!current) {
                        return current;
                    }

                    return {
                        ...current,
                        fulfillment_status:
                        action === "ready_for_pickup"
                                    ? "READY_FOR_PICKUP"
                                    : action === "picked_up"
                                    ? "PICKED_UP"
                                    : "SHIPPED",
                    };
                });
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

    async function handleVoidOrder(orderId) {
        if (updatingOrderId) {
            return;
        }

        try {
            setUpdatingOrderId(orderId);

            await voidOrder(
                orderId,
                user.id
            );

            await loadOrders(page);

            if (selectedOrder?.id === orderId) {
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
                updatingOrderId={updatingOrderId}
                page={page}
                pageSize={pageSize}
                totalOrders={totalOrders}
                onPageChange={handlePageChange}
                onView={setSelectedOrder}

                onMarkReadyForPickup={(orderId) =>
                    handleStatusUpdate(
                        orderId,
                        "ready_for_pickup"
                    )
                }

                onMarkPickedUp={(orderId) =>
                    handleStatusUpdate(
                        orderId,
                        "picked_up"
                    )
                }

                onMarkShipped={(orderId) =>
                    handleStatusUpdate(
                        orderId,
                        "shipped"
                    )
                }

                // onMarkDelivered={(orderId) =>
                //     handleStatusUpdate(
                //         orderId,
                //         "delivered"
                //     )
                // }

                onVoid={handleVoidOrder}
            />

            <OrderDetailsModal
                open={selectedOrder !== null}
                order={selectedOrder}
                onClose={() =>
                    setSelectedOrder(null)
                }
            />
        </div>
    );
}