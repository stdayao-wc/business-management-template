"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";

import ProductForm from "./ProductForm";

import { getCategories } from "@/services/categories";
import { getBrands } from "@/services/brands";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/services/products";

export default function ProductDialog({ open, product, onClose, onSuccess }) {
  const isEditing = product != null;
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

  async function handleSubmit({ form, imageFile }) {
    try {
      setSaving(true);

      let nextImagePath = product?.image_path ?? null;

      if (imageFile) {
        nextImagePath = await uploadProductImage(imageFile);
      }

      if (isEditing) {
        await updateProduct(product.id, {
          ...form,
          image_path: nextImagePath,
          is_active: product.is_active,
        });
      } else {
        await createProduct({
          ...form,
          image_path: nextImagePath,
        });
      }

      if (
        imageFile &&
        product?.image_path &&
        product.image_path !== nextImagePath
      ) {
        await deleteProductImage(product.image_path);
      }

      onClose();

      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Product" : "Add Product"}
      onClose={onClose}
    >
      <ProductForm
        product={product}
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
