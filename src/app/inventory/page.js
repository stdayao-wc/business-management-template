"use client";

import { useEffect, useState } from "react";

import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import ProductDialog from "@/components/inventory/ProductDialog";

import {
    getProducts,
    deleteProduct,
} from "@/services/products";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    async function loadProducts() {
        try {
            const data = await getProducts();

            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    }

    function handleAddProduct() {
        setSelectedProduct(null);
        setIsProductDialogOpen(true);
    }

    function handleEditProduct(product) {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    }

    function handleCloseProductDialog() {
        setSelectedProduct(null);
        setIsProductDialogOpen(false);
    }

    async function handleDeleteProduct(product) {
        const confirmed = window.confirm(
            `Delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProduct(product.id);
            await loadProducts();
        } catch (error) {
            console.error(error);
            alert("Unable to delete product.");
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="space-y-10">

            {/* Inventory Header */}

            <div className="rounded-xl bg-white px-10 py-8 shadow-sm">

                <h1 className="text-4xl font-bold">
                    Products
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

                    <button
                        onClick={handleAddProduct}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                        Add Product
                    </button>

                </div>

            </div>
            {/* Product Grid */}

            <ItemGrid>
                {products.map((product) => (
                    <ItemCard
                        key={product.id}
                        product={product}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        />
                ))}
            </ItemGrid>
            <ProductDialog
                open={isProductDialogOpen}
                product={selectedProduct}
                onClose={handleCloseProductDialog}
                onSuccess={loadProducts}
            />
        </div>
    );
}