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
        setCart(current => {
            return current.flatMap(item => {
                if (item.product.id !== productId) {
                    return item;
                }

                // Remove item if quantity reaches zero.
                if (newQuantity <= 0) {
                    return [];
                }

                // Respect available stock.
                if (newQuantity > item.product.available_stock) {
                    return item;
                }

                return {
                    ...item,
                    quantity: newQuantity,
                };
            });
        });
    }

    function addToCart(product) {
        const existing = cart.find(
            item => item.product.id === product.id
        );

        if (!existing) {
            setCart(current => [
                ...current,
                {
                    product,
                    quantity: 1,
                },
            ]);

            return;
        }

        updateQuantity(
            product.id,
            existing.quantity + 1
        );
    }

    function increaseQuantity(productId) {
        const item = cart.find(
            item => item.product.id === productId
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
            item => item.product.id === productId
        );

        if (!item) {
            return;
        }

        updateQuantity(
            productId,
            item.quantity - 1
        );
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
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
    };
}