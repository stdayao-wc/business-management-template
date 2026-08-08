"use client";

import { useEffect, useMemo, useState } from "react";

import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

import {
    getPOSProducts,
    checkout,
} from "@/services/pos";

import { useCart } from "@/hooks/useCart";
import CheckoutDialog from "@/components/pos/CheckoutDialog";
import { useAuth } from "@/context/AuthContext";
import ReceiptModal from "@/components/pos/ReceiptModal";
import { toast } from "sonner";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const { user, profile } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    function openCheckout() {
        setCheckoutOpen(true);
    }

    function closeCheckout() {
        setCheckoutOpen(false);
    }

    async function handleCheckout(payment) {
        try {
            const sale = await checkout({
                cashierId: user.id,
                cart,

                shippingMethod: payment.shippingMethod,
                customerName: payment.customerName,
                customerPhone: payment.customerPhone,
                shippingAddress: payment.shippingAddress,

                paymentMethod: payment.paymentMethod,
                amountReceived: payment.amountReceived,
                changeGiven: payment.changeGiven,
                notes: payment.notes,
            });

            setReceipt({
                sale,
                items: cart,
                cashierName: [
                    profile?.first_name,
                    profile?.last_name,
                ]
                    .filter(Boolean)
                    .join(" "),
            });

            clearCart();
            await loadProducts();
            closeCheckout();

            toast.success("Sale completed successfully.");
        } catch (error) {
            console.error("Checkout failed:", error);

            toast.error(
                error?.message ||
                "Unable to complete checkout."
            );

            throw error;
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

const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
        return products;
    }

    return products.filter((product) => {
        return (
            product.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query) ||
            product.barcode?.toLowerCase().includes(query)
        );
    });
}, [products, searchTerm]);

    return (
        <div className="grid grid-cols-12 gap-6">

            <div className="col-span-8 space-y-4">

            <ProductSearch
                value={searchTerm}
                onChange={setSearchTerm}
            />

            <ProductGrid
                products={filteredProducts}
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

            <ReceiptModal
                open={receipt !== null}
                receipt={receipt}
                onClose={() => setReceipt(null)}
            />

        </div>
    );
}