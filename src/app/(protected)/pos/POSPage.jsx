"use client";

import { useEffect, useMemo, useState } from "react";

import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";

import { getPOSProducts, checkout } from "@/services/pos";

import { useCart } from "@/hooks/useCart";
import CheckoutDialog from "@/components/pos/CheckoutDialog";
import { useAuth } from "@/context/AuthContext";
import ReceiptModal from "@/components/pos/ReceiptModal";
import { toast } from "sonner";
import QRScanner from "@/components/scanner/QRScanner";

import { getInventoryItemByCode } from "@/services/inventory";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  function openCheckout() {
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setCheckoutOpen(false);
  }

  async function handleCheckout(payment) {
    try {
      const sale = await checkout({
        cashierId: user.id,
        cart,

        shippingMethod: payment.shippingMethod,
        customerName: payment.customerName,
        customerPhone: payment.customerPhone,
        shippingAddress: payment.shippingAddress,

        paymentMethod: payment.paymentMethod,

        discountAmount: payment.discountAmount,
        shippingFee: payment.shippingFee,

        isDownpayment: payment.isDownpayment,

        amountReceived: payment.amountReceived,
        changeGiven: payment.changeGiven,
        notes: payment.notes,
      });

      setReceipt({
        sale,
        items: cart,
        cashierName: [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" "),
      });

      clearCart();
      await loadProducts();
      closeCheckout();

      toast.success("Sale completed successfully.");
    } catch (error) {
      console.error("Checkout failed:", error);

      toast.error(error?.message || "Unable to complete checkout.");

      throw error;
    }
  }

  const {
    cart,
    totals,

    addToCart,
    addInventoryItemToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();

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

  async function handleScan(itemCode) {
    try {
      const inventoryItem = await getInventoryItemByCode(itemCode);

      if (!inventoryItem) {
        toast.error(`Item ${itemCode} was not found.`);

        return;
      }

      if (inventoryItem.status?.name !== "IN_STOCK") {
        toast.error(`Item ${itemCode} is not available.`);

        return;
      }

      const product = products.find(
        (product) => product.id === inventoryItem.product_id,
      );

      if (!product) {
        toast.error("The product for this inventory item could not be found.");

        return;
      }

      const existingCartItem = cart.find(
        (item) => item.product.id === product.id,
      );

      const alreadyInCart = existingCartItem?.inventoryItems?.some(
        (item) => item.id === inventoryItem.id,
      );

      if (alreadyInCart) {
        toast.error(`Item ${itemCode} is already in the cart.`);

        return;
      }

      addInventoryItemToCart(product, inventoryItem);

      setScannerOpen(false);

      toast.success(`${product.name} added to cart.`);
    } catch (error) {
      console.error("QR scan failed:", error);

      toast.error(error?.message || "Unable to process QR code.");
    }
  }

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <ProductSearch value={searchTerm} onChange={setSearchTerm} />

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Scan QR
          </button>
        </div>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={addToCart}
        />
      </div>

      <div className="lg:col-span-4">
        <CartPanel
          cart={cart}
          totals={totals}
          onIncreaseQuantity={increaseQuantity}
          onDecreaseQuantity={decreaseQuantity}
          onRemoveItem={removeItem}
          onCheckout={openCheckout}
        />
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        totals={totals}
        onClose={closeCheckout}
        onConfirm={handleCheckout}
      />

      <ReceiptModal
        open={receipt !== null}
        receipt={receipt}
        onClose={() => setReceipt(null)}
      />
      <QRScanner
        open={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}
