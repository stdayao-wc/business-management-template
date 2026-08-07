export default function CartSummary({
    cart,
    totals,
    onCheckout,
}) {
    const itemCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <div className="border-t pt-4">

            <div className="mb-2 flex justify-between">
                <span>Total Items</span>
                <span>{itemCount}</span>
            </div>

            <div className="mb-2 flex justify-between">
                <span>Subtotal</span>
                <span>
                    ₱{totals.subtotal.toFixed(2)}
                </span>
            </div>

            <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                    ₱{totals.total.toFixed(2)}
                </span>
            </div>

            <button
                onClick={onCheckout}
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
                Checkout
            </button>

        </div>
    );
}