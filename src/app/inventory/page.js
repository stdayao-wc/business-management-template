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

import { INVENTORY_TRANSACTION_TYPES } from "@/constants/inventoryTransactions";
import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import InventoryTransactionDialog from "@/components/inventory/InventoryTransactionDialog";

import {
    getInventoryCounts,
} from "@/services/inventory";

import {
    getProducts,
} from "@/services/products";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [
        isTransactionDialogOpen,
        setIsTransactionDialogOpen,
    ] = useState(false);

    const [transactionType, setTransactionType] =
        useState(null);

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

    function openTransaction(product, type) {
        setSelectedProduct(product);
        setTransactionType(type);
        setIsTransactionDialogOpen(true);
    }

    function handleCloseTransactionDialog() {
        setSelectedProduct(null);
        setTransactionType(null);
        setIsTransactionDialogOpen(false);
    }

    function handleReceiveStock(product) {
        openTransaction(product, INVENTORY_TRANSACTION_TYPES.RECEIVE);
    }

    function handleShipStock(product) {
        openTransaction(product, INVENTORY_TRANSACTION_TYPES.SHIP);
    }

    function handleReserveStock(product) {
        openTransaction(product, INVENTORY_TRANSACTION_TYPES.RESERVE);
    }

    function handleDamageStock(product) {
        openTransaction(product, INVENTORY_TRANSACTION_TYPES.DAMAGE);
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
            <InventoryTransactionDialog
                open={isTransactionDialogOpen}
                product={selectedProduct}
                type={transactionType}
                onClose={handleCloseTransactionDialog}
                onSuccess={loadInventory}
            />
        </div>
    );
}