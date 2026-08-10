"use client";

import Modal from "@/components/common/Modal";

export default function InventoryItemDetailsModal({
    open,
    item,
    onClose,
}) {
    if (!item) {
        return null;
    }

    return (
        <Modal
            open={open}
            title="Inventory Item"
            onClose={onClose}
        >
            <div className="space-y-5">
                <div>
                    <p className="text-sm text-gray-500">
                        Item Code
                    </p>

                    <p className="text-lg font-semibold">
                        {item.item_code}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">
                        Product
                    </p>

                    <p className="font-medium">
                        {item.product?.name ??
                            "-"}
                    </p>

                    <p className="text-sm text-gray-500">
                        SKU:{" "}
                        {item.product?.sku ??
                            "-"}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-gray-500">
                            Status
                        </p>

                        <p className="font-medium">
                            {item.status?.name ??
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Location
                        </p>

                        <p className="font-medium">
                            {item.location?.name ??
                                "-"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p className="text-sm text-gray-500">
                            Received
                        </p>

                        <p className="font-medium">
                            {item.received_at
                                ? new Date(
                                      item.received_at
                                  ).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Sold
                        </p>

                        <p className="font-medium">
                            {item.sold_at
                                ? new Date(
                                      item.sold_at
                                  ).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}