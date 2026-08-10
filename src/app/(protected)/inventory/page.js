"use client";

import { useEffect, useMemo, useState } from "react";

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
import ProductSearch from "@/components/pos/ProductSearch";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [
        isTransactionDialogOpen,
        setIsTransactionDialogOpen,
    ] = useState(false);

    const [transactionType, setTransactionType] =
        useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

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

                <div className="mt-6">
                    <ProductSearch
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>

            </div>
            {/* Product Grid */}

            <ItemGrid>
                {filteredProducts.map((product) => (
                    <ItemCard
                        mode="inventory"
                        key={product.id}
                        product={product}
                        onReceiveStock={handleReceiveStock}
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