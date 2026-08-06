export default function CartSummary({
    cart,
    totals,
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

        </div>
    );
}