"use client";

import { useEffect, useState } from "react";

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "@/services/brands";

import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  description: "",
  is_active: true,
};

export default function BrandDialog({ open, onClose, onSuccess }) {
  const [brands, setBrands] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadBrands() {
    try {
      setIsLoading(true);

      const data = await getBrands();

      setBrands(data);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load brands.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadBrands();
    }
  }, [open]);

  function handleAddBrand() {
    setSelectedBrand(null);
    setFormData(EMPTY_FORM);
  }

  function handleEditBrand(brand) {
    setSelectedBrand(brand);

    setFormData({
      name: brand.name ?? "",
      description: brand.description ?? "",
      is_active: brand.is_active ?? true,
    });
  }

  function handleCancelEdit() {
    setSelectedBrand(null);
    setFormData(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      toast.error("Brand name is required.");

      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      };

      if (selectedBrand) {
        await updateBrand(selectedBrand.id, payload);

        toast.success("Brand updated successfully.");
      } else {
        await createBrand(payload);

        toast.success("Brand created successfully.");
      }

      await loadBrands();

      handleCancelEdit();

      onSuccess?.();
    } catch (err) {
      console.error(err);

      toast.error(
        selectedBrand ? "Unable to update brand." : "Unable to create brand.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBrand(brand) {
    const confirmed = window.confirm(`Delete "${brand.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteBrand(brand.id);

      if (selectedBrand?.id === brand.id) {
        handleCancelEdit();
      }

      await loadBrands();

      onSuccess?.();

      toast.success("Brand deleted successfully.");
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to delete this brand. It may still be used by products.",
      );
    }
  }

  function handleClose() {
    handleCancelEdit();
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Manage Brands</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit, or remove product brands.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
          {/* Brand Form */}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedBrand ? "Edit Brand" : "Add Brand"}
              </h3>

              {selectedBrand && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="brand-name"
                  className="mb-1 block text-sm font-medium"
                >
                  Brand Name
                </label>

                <input
                  id="brand-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label
                  htmlFor="brand-description"
                  className="mb-1 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="brand-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  rows={4}
                  className="w-full resize-none rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={isSaving}
                />
                Active brand
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : selectedBrand
                    ? "Save Changes"
                    : "Add Brand"}
              </button>
            </form>
          </div>

          {/* Brand List */}

          <div className="min-h-0">
            <h3 className="mb-4 font-semibold">Existing Brands</h3>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading brands...
              </div>
            ) : brands.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No brands found.
              </div>
            ) : (
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{brand.name}</p>

                        {!brand.is_active && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      {brand.description && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {brand.description}
                        </p>
                      )}
                    </div>

                    <div className="ml-4 flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditBrand(brand)}
                        className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand)}
                        className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
