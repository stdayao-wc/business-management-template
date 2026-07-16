"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import ProductForm from "./ProductForm";

import { getCategories } from "@/services/categories";
import { getBrands } from "@/services/brands";
import { createProduct } from "@/services/products";

export default function ProductDialog({ open, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadLookupData() {
      try {
        const [categories, brands] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(categories);
        setBrands(brands);
      } catch (err) {
        console.error(err);
      }
    }

    loadLookupData();
  }, [open]);

  async function handleSubmit(form) {
    try {
      setSaving(true);

      await createProduct(form);

      onSuccess?.();

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Add Product" onClose={onClose}>
      <ProductForm
        lookupData={{
          categories,
          brands,
        }}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
