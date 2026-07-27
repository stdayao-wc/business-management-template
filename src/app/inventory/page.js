// Inventory transactions.
//
// Current:
// - Receive
//
// Planned:
// - Ship
// - Reserve
// - Damage
//
// These operations will eventually use a shared
// InventoryTransactionDialog.

"use client";

import { useEffect, useState } from "react";

import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import ReceiveStockDialog from "@/components/inventory/ReceiveStockDialog";

import {
    getInventoryCounts,
} from "@/services/inventory";

import {
    getProducts,
} from "@/services/products";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [isReceiveStockDialogOpen, setIsReceiveStockDialogOpen] =
        useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    async function loadInventory() {
        try {
            const products = await getProducts();

            const counts = await getInventoryCounts(
                products.map((product) => product.id)
            );

            setProducts(
                products.map((product) => ({
                    ...product,
                    stock: counts[product.id] ?? 0,
                }))
            );
        } catch (err) {
            console.error(err);
        }
    }

    function handleReceiveStock(product) {
        setSelectedProduct(product);
        setIsReceiveStockDialogOpen(true);
    }

    function handleCloseReceiveStockDialog() {
        setSelectedProduct(null);
        setIsReceiveStockDialogOpen(false);
    }

    function handleShipStock(product) {
        console.log("Ship", product);
    }

    function handleReserveStock(product) {
        console.log("Reserve", product);
    }

    function handleDamageStock(product) {
        console.log("Damage", product);
    }

    useEffect(() => {
        loadInventory();
    }, []);

    return (
        <div className="space-y-10">

            {/* Inventory Header */}

            <div className="rounded-xl bg-white px-10 py-8 shadow-sm">

                <h1 className="text-4xl font-bold">
                    Inventory
                </h1>

                <div className="mt-6 flex gap-4">

                    <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                        All
                    </button>

                    <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                        Grass Cutters
                    </button>

                    <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                        Generators
                    </button>
                </div>

            </div>
            {/* Product Grid */}

            <ItemGrid>
                {products.map((product) => (
                    <ItemCard
                        mode="inventory"
                        key={product.id}
                        product={product}
                        onReceiveStock={handleReceiveStock}
                        onShipStock={handleShipStock}
                        onReserveStock={handleReserveStock}
                        onDamageStock={handleDamageStock}
                    />
                ))}
            </ItemGrid>
            <ReceiveStockDialog
                open={isReceiveStockDialogOpen}
                product={selectedProduct}
                onClose={handleCloseReceiveStockDialog}
                onSuccess={loadInventory}
            />
        </div>
    );
}