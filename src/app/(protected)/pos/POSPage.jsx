"use client";

import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

export default function POSPage() {
    return (
        <div className="grid grid-cols-12 gap-6">

            <div className="col-span-8 space-y-4">
                <ProductSearch />
                <ProductGrid />
            </div>

            <div className="col-span-4">
                <CartPanel />
            </div>

        </div>
    );
}