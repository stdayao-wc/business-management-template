"use client";

import { useEffect, useState } from "react";

import { getPOSProducts } from "@/services/pos";

// import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

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

    function handleAddToCart(product) {
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

    return (
        <div className="grid grid-cols-12 gap-6">

            <div className="col-span-8 space-y-4">

                {/* <ProductSearch /> */}

                <ProductGrid
                    products={products}
                    loading={loading}
                    onAddToCart={handleAddToCart}
                />

                <CartPanel
                    cart={cart}
                />

            </div>

            <div className="col-span-4">
                <CartPanel />
            </div>

        </div>
    );
}