"use client";

import { useEffect, useState } from "react";

const labelClass = "mb-2 block text-sm font-medium";

const fieldClass =
  "w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-500";

const primaryButtonClass =
  "rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "rounded-lg border px-5 py-2 transition hover:bg-gray-100";

  const defaultForm = {
    sku: "",
    barcode: "",
    name: "",
    description: "",

    category_id: "",
    brand_id: "",

    cost_price: "",
    selling_price: "",
  };

export default function ProductForm({
  product,
  lookupData,
  saving,
  onSubmit,
  onCancel,
}) {
  const { categories, brands } = lookupData;



  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku ?? "",
        barcode: product.barcode ?? "",
        name: product.name ?? "",
        description: product.description ?? "",

        category_id: product.category_id ?? "",
        brand_id: product.brand_id ?? "",

        cost_price: product.cost_price ?? "",
        selling_price: product.selling_price ?? "",
      });
    } else {
      setForm(defaultForm);
    }

    setImageFile(null);
  }, [product]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    setImageFile(event.target.files[0] ?? null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      form: {
        ...form,
        barcode: form.barcode || null,
        description: form.description || null,
        brand_id: form.brand_id || null,
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
      },
      imageFile,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SKU & Barcode */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>SKU *</label>

          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Barcode</label>

          <input
            type="text"
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Product Name */}

      <div>
        <label className={labelClass}>Product Name *</label>

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={fieldClass}
        />
      </div>

      {/* Product Image */}

      <div>
        <label className={labelClass}>Product Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={fieldClass}
        />
      </div>

      {/* Category & Brand */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Category *</label>

          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
            className={fieldClass}
          >
            <option value="">Select Category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Brand</label>

          <select
            name="brand_id"
            value={form.brand_id}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="">Select Brand</option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prices */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Cost Price *</label>

          <input
            type="number"
            step="0.01"
            name="cost_price"
            value={form.cost_price}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>Selling Price *</label>

          <input
            type="number"
            step="0.01"
            name="selling_price"
            value={form.selling_price}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </div>
      </div>

      {/* Description */}

      <div>
        <label className={labelClass}>Description</label>

        <textarea
          rows={4}
          name="description"
          value={form.description}
          onChange={handleChange}
          className={fieldClass}
        />
      </div>

      {/* Actions */}

      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={secondaryButtonClass}
        >
          Cancel
        </button>

        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
