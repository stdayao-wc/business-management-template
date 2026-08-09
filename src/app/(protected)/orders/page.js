"use client";

import { useEffect, useState } from "react";

import {
    getOrders,
    markOrderPickedUp,
    markOrderShipped,
    markOrderDelivered,
} from "@/services/orders";

import OrdersTable from "@/components/orders/OrdersTable";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";

import { toast } from "sonner";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    async function loadOrders() {
        try {
            setLoading(true);

            const data = await getOrders();

            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders:", error);

            toast.error(
                "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function handleStatusUpdate(
        orderId,
        action
    ) {
        if (updatingOrderId) {
            return;
        }

        try {
            setUpdatingOrderId(orderId);

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

            if (action === "delivered") {
                await markOrderDelivered(
                    orderId
                );
            }

            await loadOrders();

            // Refresh the selected order as well
            // if the modal is currently open.
            if (
                selectedOrder?.id === orderId
            ) {
                const updatedOrder =
                    orders.find(
                        (order) =>
                            order.id === orderId
                    );

                if (updatedOrder) {
                    setSelectedOrder({
                        ...updatedOrder,
                        fulfillment_status:
                            action ===
                            "picked_up"
                                ? "PICKED_UP"
                                : action ===
                                  "shipped"
                                ? "SHIPPED"
                                : "DELIVERED",
                    });
                }
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

            <OrdersTable
                orders={orders}
                loading={loading}
                updatingOrderId={
                    updatingOrderId
                }
                onView={setSelectedOrder}
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
                onMarkDelivered={(orderId) =>
                    handleStatusUpdate(
                        orderId,
                        "delivered"
                    )
                }
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