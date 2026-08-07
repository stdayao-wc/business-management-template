import { useMemo, useState } from "react";

import { calculateTotals } from "@/services/pos";

export function useCart() {
    const [cart, setCart] = useState([]);

    const totals = useMemo(() => {
        return calculateTotals(cart);
    }, [cart]);

    function addToCart(product) {
        setCart(current => {
            const existing = current.find(
                item => item.product.id === product.id
            );

            if (existing) {
                if (existing.quantity >= product.available_stock) {
                    return current;
                }

                return current.map(item =>
                    item.product.id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                          }
                        : item
                );
            }

            return [
                ...current,
                {
                    product,
                    quantity: 1,
                },
            ];
        });
    }

    function increaseQuantity(productId) {
        setCart(current =>
            current.map(item => {
                if (item.product.id !== productId) {
                    return item;
                }

                if (item.quantity >= item.product.available_stock) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            })
        );
    }

    function decreaseQuantity(productId) {
        setCart(current =>
            current.flatMap(item => {
                if (item.product.id !== productId) {
                    return item;
                }

                if (item.quantity === 1) {
                    return [];
                }

                return {
                    ...item,
                    quantity: item.quantity - 1,
                };
            })
        );
    }

    function removeItem(productId) {
        setCart(current =>
            current.filter(
                item => item.product.id !== productId
            )
        );
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