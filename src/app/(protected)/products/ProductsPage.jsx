"use client";

import { useEffect, useMemo, useState } from "react";

import ProductSearch from "@/components/pos/ProductSearch";
import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import ProductDialog from "@/components/inventory/ProductDialog";
import BrandDialog from "@/components/inventory/BrandDialog";

import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

import { getProducts, deleteProduct } from "@/services/products";

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

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

  function handleOpenBrandDialog() {
    setIsBrandDialogOpen(true);
  }

  function handleCloseBrandDialog() {
    setIsBrandDialogOpen(false);
  }

  async function loadProducts() {
    try {
      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load products.");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const startProduct =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const endProduct = Math.min(
    currentPage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  return (
    <div className="space-y-10">
      {/* Products Header */}

      <div className="rounded-xl bg-white px-10 py-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">Products</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenBrandDialog}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              Manage Brands
            </button>

            {can("products.create") && (
              <button
                type="button"
                onClick={handleAddProduct}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Add Product
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ProductSearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Product Grid */}

      {paginatedProducts.length > 0 ? (
        <ItemGrid>
          {paginatedProducts.map((product) => (
            <ItemCard
              mode="catalog"
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </ItemGrid>
      ) : (
        <div className="rounded-xl bg-white px-10 py-12 text-center shadow-sm">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      {/* Pagination */}

      {filteredProducts.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            Showing {startProduct}–{endProduct} of {filteredProducts.length}{" "}
            products
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProductDialog
        open={isProductDialogOpen}
        product={selectedProduct}
        onClose={handleCloseProductDialog}
        onSuccess={loadProducts}
      />

      <BrandDialog open={isBrandDialogOpen} onClose={handleCloseBrandDialog} />
    </div>
  );
}
