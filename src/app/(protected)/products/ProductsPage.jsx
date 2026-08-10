"use client";

import { useEffect, useMemo, useState } from "react";

import ProductSearch from "@/components/pos/ProductSearch";
import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import ProductDialog from "@/components/inventory/ProductDialog";
import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

import { getProducts, deleteProduct } from "@/services/products";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const { can } = useAuth();

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

  async function loadProducts() {
    try {
      const products = await getProducts();

      setProducts(products);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);

      await loadProducts();

      toast.success("Product deleted successfully.");
    } catch (err) {
      console.error(err);

      toast.error("Unable to delete product.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

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
    <div className="space-y-10">
      {/* Products Header */}

      <div className="rounded-xl bg-white px-10 py-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">Products</h1>

          {can("products.create") && (
            <button
              onClick={handleAddProduct}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Add Product
            </button>
          )}
        </div>

        <div className="mt-6">
          <ProductSearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Product Grid */}

      <ItemGrid>
        {filteredProducts.map((product) => (
          <ItemCard
            mode="catalog"
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
