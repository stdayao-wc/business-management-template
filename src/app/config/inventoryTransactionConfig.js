import {
    INVENTORY_TRANSACTION_TYPES,
} from "@/constants/inventoryTransactions";

import {
    receiveStock,
    shipStock,
    damageStock,
} from "@/services/inventory";

function createTransaction(config) {
    return {
        variant: "primary",
        service: null,
        ...config,
    };
}

export const TRANSACTION_CONFIG = {
    [INVENTORY_TRANSACTION_TYPES.RECEIVE]:
        createTransaction({
            title: "Receive Stock",
            action: "Receive Stock",
            loading: "Receiving...",
            service: receiveStock,
        }),

    [INVENTORY_TRANSACTION_TYPES.SHIP]:
        createTransaction({
            title: "Ship Stock",
            action: "Ship Stock",
            loading: "Shipping...",
            service: shipStock,
        }),

    [INVENTORY_TRANSACTION_TYPES.DAMAGE]:
        createTransaction({
            title: "Report Damaged Stock",
            action: "Record Damage",
            loading: "Recording...",
            variant: "danger",
            service: damageStock,
        }),
};