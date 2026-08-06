export default function CartItem({ item }) {
    const lineTotal =
        item.product.selling_price * item.quantity;

    return (
        <div className="border-b pb-3">

            <div className="flex items-start justify-between">

                <div>

                    <p className="font-medium">
                        {item.product.name}
                    </p>

                    <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                    </p>

                    <p className="text-sm text-gray-500">
                        ₱{Number(item.product.selling_price).toFixed(2)} each
                    </p>

                </div>

                <p className="font-semibold">
                    ₱{lineTotal.toFixed(2)}
                </p>

            </div>

        </div>
    );
}