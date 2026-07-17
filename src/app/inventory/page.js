"use client";

import { useEffect, useState } from "react";

import ItemGrid from "@/components/inventory/ItemGrid";
import ProductDialog from "@/components/inventory/ProductDialog";

import { getProducts } from "@/services/products";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    async function loadProducts() {
        try {
            const data = await getProducts();

            setProducts(data);
        } catch (err) {
            console.error(err);
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
                        onClick={() => setIsProductDialogOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                        Add Product
                    </button>

                </div>

            </div>
            {/* Product Grid */}

            <ItemGrid>

                {products.map((product) => (

                    <div
                        key={product.id}
                        className="rounded-lg border bg-white p-4 shadow-sm"
                    >

                        <h2 className="font-semibold">
                            {product.name}
                        </h2>

                        <p>{product.sku}</p>

                        <p>
                            {product.categories?.name ??
                                "No Category"}
                        </p>

                        <p>
                            {product.brands?.name ??
                                "No Brand"}
                        </p>

                    </div>

                ))}

            </ItemGrid>
            <ProductDialog
                open={isProductDialogOpen}
                onClose={() => setIsProductDialogOpen(false)}
                onSuccess={loadProducts}
            />
        </div>
    );
}