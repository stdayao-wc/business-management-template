export default function CartItem({
    item,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveItem,
}){
    const lineTotal =
        item.product.selling_price * item.quantity;

    return (
        <div className="border-b pb-3">

            <div className="flex items-start justify-between">

                <div>

                    <p className="font-medium">
                        {item.product.name}
                    </p>

                    {/* <p className="text-sm text-gray-500"> */}
                        <div className="mt-2 flex items-center gap-2">

                            <button
                                onClick={() =>
                                    onDecreaseQuantity(item.product.id)
                                }
                                className="h-8 w-8 rounded border"
                            >
                                −
                            </button>

                            <span className="w-8 text-center">
                                {item.quantity}
                            </span>

                            <button
                                onClick={() =>
                                    onIncreaseQuantity(item.product.id)
                                }
                                disabled={
                                    item.quantity >=
                                    item.product.available_stock
                                }
                                className="h-8 w-8 rounded border disabled:opacity-50"
                            >
                                +
                            </button>
                            <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="mt-2 text-sm text-red-600 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    {/* </p> */}

                    <p className="text-sm text-gray-500">
                        ₱{Number(item.product.selling_price).toFixed(2)} each
                    </p>

                </div>

                <p className="font-semibold">
                    ₱{Number(lineTotal).toFixed(2)}
                </p>

            </div>

        </div>
    );
}