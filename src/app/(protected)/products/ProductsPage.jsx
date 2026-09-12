"use client";

import { useEffect, useMemo, useState } from "react";

import ProductSearch from "@/components/pos/ProductSearch";
import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import ProductDialog from "@/components/inventory/ProductDialog";
import BrandDialog from "@/components/inventory/BrandDialog";
import CategoryDialog from "@/components/inventory/CategoryDialog";

import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

import { getProducts, deleteProduct } from "@/services/products";

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

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

  function handleOpenCategoryDialog() {
    setIsCategoryDialogOpen(true);
  }

  function handleCloseCategoryDialog() {
    setIsCategoryDialogOpen(false);
  }

  async function loadProducts() {
    setIsLoading(true);

    try {
      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load products.");
    } finally {
      setIsLoading(false);
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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Products Header */}

      <div className="rounded-xl bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">Products</h1>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center md:gap-3">
            <button
              type="button"
              onClick={handleOpenCategoryDialog}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Manage Categories
            </button>

            <button
              type="button"
              onClick={handleOpenBrandDialog}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Manage Brands
            </button>

            {can("products.create") && (
              <button
                type="button"
                onClick={handleAddProduct}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 sm:w-auto"
              >
                Add Product
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <ProductSearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Product Grid */}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
              aria-label="Loading products"
              role="status"
            />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        </div>
      ) : paginatedProducts.length > 0 ? (
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
        <div className="rounded-xl bg-white px-4 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      {/* Pagination */}

      {!isLoading && filteredProducts.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-sm text-gray-500 sm:text-left">
            Showing {startProduct}–{endProduct} of {filteredProducts.length}{" "}
            products
          </p>

          <div className="flex w-full items-center justify-center gap-1.5 sm:w-auto sm:gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              Previous
            </button>

            <span className="px-1 text-center text-sm text-gray-600 sm:px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
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

      <CategoryDialog
        open={isCategoryDialogOpen}
        onClose={handleCloseCategoryDialog}
      />
    </div>
  );
}
