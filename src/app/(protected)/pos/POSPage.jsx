"use client";

import { useEffect, useState } from "react";

// import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

import { getPOSProducts } from "@/services/pos";

import { useCart } from "@/hooks/useCart";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const {
        cart,
        totals,

        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
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
                />
            </div>

        </div>
    );
}