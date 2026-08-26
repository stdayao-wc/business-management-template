import { supabase } from "@/lib/supabase/client";
import { getProducts } from "./products";

import {
    getInventoryCounts,
    getAvailableInventoryItems,
    getInventoryItemByCode,
    sellInventoryItems,
    reserveInventoryItems,
} from "@/services/inventory";

export function calculateTotals(
    cart,
    {
        discountAmount = 0,
        shippingFee = 0,
    } = {}
) {
    let subtotal = 0;

    for (const item of cart) {
        subtotal +=
            Number(item.product.selling_price) *
            item.quantity;
    }

    const discount =
        Number(discountAmount) || 0;

    const shipping =
        Number(shippingFee) || 0;

    const total = Math.max(
        subtotal - discount + shipping,
        0
    );

    return {
        subtotal,
        discountAmount: discount,
        shippingFee: shipping,
        total,
    };
}

async function validateExactInventoryItems(item) {
    const exactItems =
        item.inventoryItems ?? [];

    if (!exactItems.length) {
        return null;
    }

    for (const inventoryItem of exactItems) {
        const currentItem =
            await getInventoryItemByCode(
                inventoryItem.item_code
            );

        if (!currentItem) {
            return {
                valid: false,
                message: `Inventory item ${inventoryItem.item_code} was not found.`,
            };
        }

        if (
            currentItem.status?.name !==
            "IN_STOCK"
        ) {
            return {
                valid: false,
                message: `Inventory item ${inventoryItem.item_code} is no longer available.`,
            };
        }
    }

    return null;
}

export async function validateCart(cart) {
    if (!cart.length) {
        return {
            valid: false,
            message: "Cart is empty.",
        };
    }

    for (const item of cart) {
        if (item.quantity <= 0) {
            return {
                valid: false,
                message: `${item.product.name} has an invalid quantity.`,
            };
        }

        const exactValidation =
            await validateExactInventoryItems(
                item
            );

        if (exactValidation) {
            return exactValidation;
        }

        const exactItems =
            item.inventoryItems ?? [];

        const additionalQuantity =
            Math.max(
                0,
                item.quantity -
                    exactItems.length
            );

        if (additionalQuantity > 0) {
            const availableItems =
                await getAvailableInventoryItems(
                    item.product.id,
                    additionalQuantity,
                    exactItems.map(
                        (inventoryItem) =>
                            inventoryItem.id
                    )
                );

            if (
                availableItems.length <
                additionalQuantity
            ) {
                return {
                    valid: false,
                    message: `Not enough stock for ${item.product.name}.`,
                };
            }
        }
    }

    return {
        valid: true,
    };
}

function generateReceiptNumber() {
    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        String(
            now.getDate()
        ).padStart(2, "0");

    const random =
        Math.floor(
            Math.random() * 999999
        )
            .toString()
            .padStart(6, "0");

    return `POS-${date}-${random}`;
}

async function createSale({
    cashierId,
    totals,

    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,

    paymentMethod,
    amountReceived,
    changeGiven,
    notes,

    isDownpayment,
    downpaymentAmount,
}) {
    const fulfillmentStatus =
        getInitialFulfillmentStatus(
            shippingMethod,
            isDownpayment
        );

    const normalizedCustomerName =
        customerName.trim();

    const normalizedCustomerPhone =
        customerPhone.trim();

    const normalizedShippingAddress =
        shippingAddress?.trim() || null;

    const {
        data,
        error,
    } = await supabase
        .from("sales")
        .insert({
            receipt_number:
                generateReceiptNumber(),

            cashier_id:
                cashierId,

            subtotal:
                totals.subtotal,

            discount_amount:
                totals.discountAmount,

            shipping_fee:
                totals.shippingFee,

            total:
                totals.total,

            payment_method:
                paymentMethod,

            amount_received:
                amountReceived,

            change_given:
                changeGiven,

            notes,

            customer_name:
                normalizedCustomerName,

            customer_phone:
                normalizedCustomerPhone,

            shipping_address:
                shippingMethod ===
                "PICKUP"
                    ? null
                    : normalizedShippingAddress,

            shipping_method:
                shippingMethod,

            fulfillment_status:
                fulfillmentStatus,

            is_downpayment:
                isDownpayment,

            downpayment_amount:
                downpaymentAmount,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function createSaleItems(
    saleId,
    cart
) {
    const rows = cart.map(
        (item) => ({
            sale_id:
                saleId,

            product_id:
                item.product.id,

            quantity:
                item.quantity,

            unit_price:
                item.product
                    .selling_price,

            cost_price:
                item.product
                    .cost_price,

            line_total:
                item.product
                    .selling_price *
                item.quantity,
        })
    );

    const {
        error,
    } = await supabase
        .from("sale_items")
        .insert(rows);

    if (error) {
        throw error;
    }
}

async function resolveInventoryItemsForCartItem(
    item
) {
    const exactItems =
        item.inventoryItems ?? [];

    const exactIds =
        new Set(
            exactItems.map(
                (inventoryItem) =>
                    inventoryItem.id
            )
        );

    if (
        exactItems.length >=
        item.quantity
    ) {
        return exactItems.slice(
            0,
            item.quantity
        );
    }

    const additionalQuantity =
        item.quantity -
        exactItems.length;

    const availableItems =
        await getAvailableInventoryItems(
            item.product.id,
            additionalQuantity,
            [...exactIds]
        );

    const additionalItems =
        availableItems.filter(
            (inventoryItem) =>
                !exactIds.has(
                    inventoryItem.id
                )
        );

    if (
        additionalItems.length <
        additionalQuantity
    ) {
        throw new Error(
            `Not enough stock for ${item.product.name}.`
        );
    }

    return [
        ...exactItems,
        ...additionalItems.slice(
            0,
            additionalQuantity
        ),
    ];
}

export async function checkout({
    cashierId,
    cart,

    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,

    paymentMethod = "Cash",

    discountAmount = 0,
    shippingFee = 0,

    amountReceived,
    changeGiven,
    notes = "",

    isDownpayment = false,
}) {
    validateShippingDetails({
        shippingMethod,
        customerName,
        customerPhone,
        shippingAddress,
    });

    const validation =
        await validateCart(
            cart
        );

    if (!validation.valid) {
        throw new Error(
            validation.message
        );
    }

    const normalizedDiscountAmount =
        Number(discountAmount);

    if (
        !Number.isFinite(
            normalizedDiscountAmount
        ) ||
        normalizedDiscountAmount < 0
    ) {
        throw new Error(
            "Discount amount must be a valid non-negative amount."
        );
    }

    const normalizedShippingFee =
        Number(shippingFee);

    if (
        !Number.isFinite(
            normalizedShippingFee
        ) ||
        normalizedShippingFee < 0
    ) {
        throw new Error(
            "Shipping fee must be a valid non-negative amount."
        );
    }

    if (
        shippingMethod === "PICKUP" &&
        normalizedShippingFee !== 0
    ) {
        throw new Error(
            "Shipping fee must be zero for pickup orders."
        );
    }

    const baseTotals =
        calculateTotals(cart);

    if (
        normalizedDiscountAmount >
        baseTotals.subtotal
    ) {
        throw new Error(
            "Discount cannot exceed the subtotal."
        );
    }

    const totals =
        calculateTotals(
            cart,
            {
                discountAmount:
                    normalizedDiscountAmount,
                shippingFee:
                    normalizedShippingFee,
            }
        );

    const normalizedAmountReceived =
        Number(
            amountReceived
        );

    if (
        !Number.isFinite(
            normalizedAmountReceived
        ) ||
        normalizedAmountReceived < 0
    ) {
        throw new Error(
            "Amount received must be a valid amount."
        );
    }

    const normalizedChangeGiven =
        isDownpayment
            ? 0
            : Math.max(
                normalizedAmountReceived -
                    totals.total,
                0
            );

    if (
        isDownpayment &&
        normalizedAmountReceived <=
            0
    ) {
        throw new Error(
            "Downpayment amount must be greater than zero."
        );
    }

    if (
        isDownpayment &&
        normalizedAmountReceived >=
            totals.total
    ) {
        throw new Error(
            "A downpayment must be less than the total sale amount."
        );
    }

    if (
        !isDownpayment &&
        normalizedAmountReceived <
            totals.total
    ) {
        throw new Error(
            "Amount received is less than the sale total."
        );
    }

    const normalizedDownpaymentAmount =
        isDownpayment
            ? normalizedAmountReceived
            : 0;

    const sale =
        await createSale({
            cashierId,
            totals,

            shippingMethod,
            customerName,
            customerPhone,
            shippingAddress,

            paymentMethod,
            amountReceived:
                normalizedAmountReceived,
            changeGiven:
                normalizedChangeGiven,
            notes,

            isDownpayment,
            downpaymentAmount:
                normalizedDownpaymentAmount,
        });

    try {
        await createSaleItems(
            sale.id,
            cart
        );

        for (
            const item of cart
        ) {
            const inventoryItems =
                await resolveInventoryItemsForCartItem(
                    item
                );

        if (isDownpayment) {
            await reserveInventoryItems(
                inventoryItems,
                cashierId,
                sale.id
            );
        } else {
            await sellInventoryItems(
                inventoryItems,
                cashierId,
                sale.id
            );
        }
        }
    } catch (error) {
        console.error(
            "Checkout inventory processing failed:",
            error
        );

        throw error;
    }

    return sale;
}

export async function getPOSProducts() {
    const products =
        await getProducts();

    const stockMap =
        await getInventoryCounts(
            products.map(
                (product) =>
                    product.id
            )
        );

    return products.map(
        (product) => {
            const availableStock =
                stockMap[
                    product.id
                ] ?? 0;

            return {
                ...product,

                available_stock:
                    availableStock,

                is_out_of_stock:
                    availableStock ===
                    0,
            };
        }
    );
}

function getInitialFulfillmentStatus(
    shippingMethod,
    isDownpayment
) {
    if (isDownpayment) {
        return "PENDING";
    }

    if (
        shippingMethod ===
        "PICKUP"
    ) {
        return "READY_FOR_PICKUP";
    }

    return "PENDING";
}

function isValidPhilippinePhone(
    phone
) {
    const normalized =
        phone
            .trim()
            .replace(
                /[\s()-]/g,
                ""
            );

    return /^(09\d{9}|639\d{9}|\+639\d{9})$/.test(
        normalized
    );
}

function validateShippingDetails({
    shippingMethod,
    customerName,
    customerPhone,
    shippingAddress,
}) {
    if (!shippingMethod) {
        throw new Error(
            "Shipping method is required."
        );
    }

    if (
        ![
            "PICKUP",
            "LBC",
            "J&T",
        ].includes(
            shippingMethod
        )
    ) {
        throw new Error(
            "Invalid shipping method."
        );
    }

    if (
        !customerName?.trim()
    ) {
        throw new Error(
            "Customer name is required."
        );
    }

    if (
        !customerPhone?.trim()
    ) {
        throw new Error(
            "Customer number is required."
        );
    }

    if (
        !isValidPhilippinePhone(
            customerPhone
        )
    ) {
        throw new Error(
            "Please enter a valid Philippine phone number."
        );
    }

    if (
        shippingMethod !==
            "PICKUP" &&
        !shippingAddress?.trim()
    ) {
        throw new Error(
            "Shipping address is required for delivery."
        );
    }
}