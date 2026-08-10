"use client";

import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/common/Modal";
import { getInventoryItems } from "@/services/inventory";
import { generateInventoryQrPdf } from "@/services/inventoryQr";

import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function InventoryItemsModal({
    open,
    product,
    onClose,
}) {
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    /*
     * ----------------------------------------------------------------------
     * FILTER
     * ----------------------------------------------------------------------
     */

    const filteredItems = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter((item) =>
            item.item_code?.toLowerCase().includes(query)
        );
    }, [items, searchTerm]);

    /*
     * ----------------------------------------------------------------------
     * PAGINATION
     * ----------------------------------------------------------------------
     */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
    );

    const paginatedItems = useMemo(() => {
        const startIndex =
            (currentPage - 1) * ITEMS_PER_PAGE;

        return filteredItems.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
        );
    }, [filteredItems, currentPage]);

    /*
     * Keep current page valid if filtering reduces the
     * number of available pages.
     */

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    /*
     * ----------------------------------------------------------------------
     * LOAD
     * ----------------------------------------------------------------------
     */

    useEffect(() => {
        if (!open || !product?.id) {
            return;
        }

        async function loadItems() {
            try {
                setLoading(true);
                setSelectedIds([]);
                setSearchTerm("");
                setCurrentPage(1);

                const data = await getInventoryItems(
                    product.id
                );

                setItems(data);
            } catch (err) {
                console.error(err);

                toast.error(
                    "Unable to load inventory items."
                );
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, [open, product]);

    /*
     * ----------------------------------------------------------------------
     * SELECTION
     * ----------------------------------------------------------------------
     */

    function toggleItem(itemId) {
        setSelectedIds((current) => {
            if (current.includes(itemId)) {
                return current.filter(
                    (id) => id !== itemId
                );
            }

            return [...current, itemId];
        });
    }

    /*
     * Select / deselect all items visible on the
     * current page only.
     */

    const allCurrentPageSelected =
        paginatedItems.length > 0 &&
        paginatedItems.every((item) =>
            selectedIds.includes(item.id)
        );

    function toggleCurrentPage() {
        const currentPageIds = paginatedItems.map(
            (item) => item.id
        );

        if (allCurrentPageSelected) {
            setSelectedIds((current) =>
                current.filter(
                    (id) => !currentPageIds.includes(id)
                )
            );

            return;
        }

        setSelectedIds((current) => [
            ...new Set([
                ...current,
                ...currentPageIds,
            ]),
        ]);
    }

    /*
     * ----------------------------------------------------------------------
     * QR GENERATION
     * ----------------------------------------------------------------------
     */

    async function handleGenerateSelected() {
        const selectedItems = items.filter((item) =>
            selectedIds.includes(item.id)
        );

        if (!selectedItems.length) {
            toast.error(
                "Select at least one inventory item."
            );

            return;
        }

        try {
            setGenerating(true);

            await generateInventoryQrPdf(
                selectedItems.map((item) => ({
                    ...item,
                    product_name: product.name,
                }))
            );

            toast.success(
                `${selectedItems.length} QR code${
                    selectedItems.length === 1
                        ? ""
                        : "s"
                } added to PDF.`
            );
        } catch (err) {
            console.error(err);

            toast.error(
                "Unable to generate QR PDF."
            );
        } finally {
            setGenerating(false);
        }
    }

    async function handleGenerateSingle(item) {
        try {
            setGenerating(true);

            await generateInventoryQrPdf([
                {
                    ...item,
                    product_name: product.name,
                },
            ]);

            toast.success(
                "QR code PDF generated."
            );
        } catch (err) {
            console.error(err);

            toast.error(
                "Unable to generate QR PDF."
            );
        } finally {
            setGenerating(false);
        }
    }

    /*
     * ----------------------------------------------------------------------
     * PAGINATION CONTROLS
     * ----------------------------------------------------------------------
     */

    function goToPreviousPage() {
        setCurrentPage((current) =>
            Math.max(1, current - 1)
        );
    }

    function goToNextPage() {
        setCurrentPage((current) =>
            Math.min(totalPages, current + 1)
        );
    }

    /*
     * Reset pagination when search changes.
     */

    function handleSearchChange(event) {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    }

    const showingFrom =
        filteredItems.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const showingTo = Math.min(
        currentPage * ITEMS_PER_PAGE,
        filteredItems.length
    );

    /*
     * ----------------------------------------------------------------------
     * RENDER
     * ----------------------------------------------------------------------
     */

    return (
        <Modal
            open={open}
            title={`Inventory Items — ${product?.name ?? ""}`}
            onClose={onClose}
        >
            <div className="space-y-5">

                {/* Header */}

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            {searchTerm
                                ? `${filteredItems.length} of ${items.length} items`
                                : `${items.length} item${
                                      items.length === 1
                                          ? ""
                                          : "s"
                                  }`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateSelected}
                        disabled={
                            generating ||
                            selectedIds.length === 0
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {generating
                            ? "Generating..."
                            : `Generate QR${
                                  selectedIds.length
                                      ? ` (${selectedIds.length})`
                                      : ""
                              }`}
                    </button>
                </div>

                {/* Search */}

                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search item code..."
                        className="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Content */}

                {loading ? (
                    <div className="py-10 text-center text-sm text-gray-500">
                        Loading inventory items...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                        No inventory items found.
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                        No inventory items match your search.
                    </div>
                ) : (
                    <>
                        {/* Table */}

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    allCurrentPageSelected
                                                }
                                                onChange={
                                                    toggleCurrentPage
                                                }
                                                aria-label="Select all items on current page"
                                            />
                                        </th>

                                        <th className="px-4 py-3 font-semibold">
                                            Item Code
                                        </th>

                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 font-semibold">
                                            Location
                                        </th>

                                        <th className="px-4 py-3 font-semibold">
                                            Received
                                        </th>

                                        <th className="px-4 py-3 text-right font-semibold">
                                            QR
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {paginatedItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        item.id
                                                    )}
                                                    onChange={() =>
                                                        toggleItem(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label={`Select ${item.item_code}`}
                                                />
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {item.item_code}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.status?.name ??
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.location?.name ??
                                                    "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.received_at
                                                    ? new Date(
                                                          item.received_at
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleGenerateSingle(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        generating
                                                    }
                                                    className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    QR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}

                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Showing {showingFrom}–{showingTo} of{" "}
                                {filteredItems.length}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <span className="min-w-20 text-center text-sm text-gray-600">
                                    Page {currentPage} of{" "}
                                    {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={goToNextPage}
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}