"use client";

import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "@/services/categories";

import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  description: "",
  is_active: true,
};

export default function CategoryDialog({ open, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [isLoading, setIsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  async function loadCategories() {
    try {
      setIsLoading(true);

      const data = await getAllCategories();

      setCategories(data);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  function handleAddCategory() {
    setSelectedCategory(null);
    setFormData(EMPTY_FORM);
  }

  function handleEditCategory(category) {
    setSelectedCategory(category);

    setFormData({
      name: category.name ?? "",
      description: category.description ?? "",
      is_active: category.is_active ?? true,
    });
  }

  function handleCancelEdit() {
    setSelectedCategory(null);
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
      toast.error("Category name is required.");

      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      };

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, payload);

        toast.success("Category updated successfully.");
      } else {
        await createCategory(payload);

        toast.success("Category created successfully.");
      }

      await loadCategories();

      handleCancelEdit();

      onSuccess?.();
    } catch (err) {
      console.error(err);

      toast.error(
        selectedCategory
          ? "Unable to update category."
          : "Unable to create category.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(`Delete "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(category.id);

      if (selectedCategory?.id === category.id) {
        handleCancelEdit();
      }

      await loadCategories();

      onSuccess?.();

      toast.success("Category deleted successfully.");
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to delete this category. It may still be used by products.",
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
      {" "}
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Manage Categories</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit, or remove product categories.
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
          {/* Category Form */}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedCategory ? "Edit Category" : "Add Category"}
              </h3>

              {selectedCategory && (
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
                  htmlFor="category-name"
                  className="mb-1 block text-sm font-medium"
                >
                  Category Name
                </label>

                <input
                  id="category-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-1 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
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
                Active category
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : selectedCategory
                    ? "Save Changes"
                    : "Add Category"}
              </button>
            </form>
          </div>

          {/* Category List */}

          <div className="min-h-0">
            <h3 className="mb-4 font-semibold">Existing Categories</h3>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No categories found.
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{category.name}</p>

                        {!category.is_active && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      {category.description && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="ml-4 flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCategory(category)}
                        className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category)}
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
