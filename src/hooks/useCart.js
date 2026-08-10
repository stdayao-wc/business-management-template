import { useMemo, useState } from "react";

import { calculateTotals } from "@/services/pos";

export function useCart() {
    const [cart, setCart] = useState([]);

    const totals = useMemo(() => {
        return calculateTotals(cart);
    }, [cart]);

    /**
     * Internal helper.
     * Updates the quantity of a cart item.
     */
    function updateQuantity(productId, newQuantity) {
        setCart((current) => {
            return current.flatMap((item) => {
                if (item.product.id !== productId) {
                    return item;
                }

                if (newQuantity <= 0) {
                    return [];
                }

                if (
                    newQuantity >
                    item.product.available_stock
                ) {
                    return item;
                }

                return {
                    ...item,
                    quantity: newQuantity,
                };
            });
        });
    }

    /**
     * Adds a normal product to the cart.
 *
     * These items do not have a preselected
     * inventory item. Checkout will select
     * available inventory later.
     */
    function addToCart(product) {
        const existing = cart.find(
            (item) =>
                item.product.id === product.id
        );

        if (!existing) {
            setCart((current) => [
                ...current,
                {
                    product,
                    quantity: 1,
                    inventoryItems: [],
                },
            ]);

            return;
        }

        updateQuantity(
            product.id,
            existing.quantity + 1
        );
    }

    /**
     * Adds a specific inventory item to the cart.
 *
     * Used by QR scanning.
     */
    function addInventoryItemToCart(
        product,
        inventoryItem
    ) {
        setCart((current) => {
            const existing = current.find(
                (item) =>
                    item.product.id === product.id
            );

            if (!existing) {
                return [
                    ...current,
                    {
                        product,
                        quantity: 1,
                        inventoryItems: [
                            inventoryItem,
                        ],
                    },
                ];
            }

            const alreadyAdded =
                existing.inventoryItems?.some(
                    (item) =>
                        item.id === inventoryItem.id
                );

            if (alreadyAdded) {
                return current;
            }

            if (
                existing.quantity >=
                product.available_stock
            ) {
                return current;
            }

            return current.map((item) => {
                if (
                    item.product.id !== product.id
                ) {
                    return item;
                }

                return {
                    ...item,
                    quantity:
                        item.quantity + 1,
                    inventoryItems: [
                        ...(item.inventoryItems ?? []),
                        inventoryItem,
                    ],
                };
            });
        });
    }

    function increaseQuantity(productId) {
        const item = cart.find(
            (item) =>
                item.product.id === productId
        );

        if (!item) {
            return;
        }

        updateQuantity(
            productId,
            item.quantity + 1
        );
    }

    function decreaseQuantity(productId) {
        const item = cart.find(
            (item) =>
                item.product.id === productId
        );

        if (!item) {
            return;
        }

        setCart((current) => {
            return current.flatMap((cartItem) => {
                if (
                    cartItem.product.id !==
                    productId
                ) {
                    return cartItem;
                }

                const nextQuantity =
                    cartItem.quantity - 1;

                if (nextQuantity <= 0) {
                    return [];
                }

                const inventoryItems =
                    cartItem.inventoryItems ?? [];

                return {
                    ...cartItem,
                    quantity: nextQuantity,
                    inventoryItems:
                        inventoryItems.length >
                        0
                            ? inventoryItems.slice(
                                  0,
                                  -1
                              )
                            : [],
                };
            });
        });
    }

    function removeItem(productId) {
        updateQuantity(productId, 0);
    }

    function clearCart() {
        setCart([]);
    }

    return {
        cart,
        totals,

        addToCart,
        addInventoryItemToCart,

        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
    };
}