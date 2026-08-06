export default function CartPanel({ cart = [] }) {
    return (
        <div className="rounded-lg border p-4">

            <h2 className="mb-4 text-lg font-semibold">
                Shopping Cart
            </h2>

            {cart.length === 0 ? (
                <p className="text-sm text-gray-500">
                    Cart is empty.
                </p>
            ) : (
                <>
                    {cart.map(item => (
                        <div
                            key={item.product.id}
                            className="mb-4 border-b pb-3"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">
                                        {item.product.name}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Qty: {item.quantity}
                                    </p>
                                </div>

                                <p className="font-semibold">
                                    ₱{(
                                        item.product.selling_price *
                                        item.quantity
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </>
            )}

        </div>
    );
}