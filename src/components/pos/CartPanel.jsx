import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

export default function CartPanel({
    cart = [],
    totals,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveItem,
}) {
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
                    <div className="space-y-3">

                        {cart.map(item => (
                            <CartItem
                                key={item.product.id}
                                item={item}
                                onIncreaseQuantity={onIncreaseQuantity}
                                onDecreaseQuantity={onDecreaseQuantity}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}

                    </div>

                    <CartSummary
                        cart={cart}
                        totals={totals}
                    />

                </>
            )}

        </div>
    );
}