"use client";

import { useEffect, useState } from "react";

// import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

import {
    getPOSProducts,
    checkout,
} from "@/services/pos";

import { useCart } from "@/hooks/useCart";
import CheckoutDialog from "@/components/pos/CheckoutDialog";
import { useAuth } from "@/context/AuthContext";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const { user } = useAuth();

    function openCheckout() {
        setCheckoutOpen(true);
    }

    function closeCheckout() {
        setCheckoutOpen(false);
    }

    async function handleCheckout(payment) {
        try {
            await checkout({
                cashierId: user.id,
                cart,
                paymentMethod: payment.paymentMethod,
                amountReceived: payment.amountReceived,
                changeGiven: payment.changeGiven,
                notes: payment.notes,
            });

            clearCart();
            await loadProducts();
            closeCheckout();
        } catch (error) {
            console.error("Checkout failed:", error);
        }
    }
    const {
        cart,
        totals,

        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
    } = useCart();


    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getPOSProducts();
            setProducts(data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-12 gap-6">

            <div className="col-span-8 space-y-4">

                {/* <ProductSearch /> */}

                <ProductGrid
                    products={products}
                    loading={loading}
                    onAddToCart={addToCart}
                />

                

            </div>

            <div className="col-span-4">
                <CartPanel
                    cart={cart}
                    totals={totals}
                    onIncreaseQuantity={increaseQuantity}
                    onDecreaseQuantity={decreaseQuantity}
                    onRemoveItem={removeItem}
                    onCheckout={openCheckout}
                />
            </div>

            <CheckoutDialog
                open={checkoutOpen}
                totals={totals}
                onClose={closeCheckout}
                onConfirm={handleCheckout}
            />

        </div>
    );
}