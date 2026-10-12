import { useState } from "react";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../utils/money";
import Button from "./Button";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, isPending } = useCart();
  const [error, setError] = useState("");
  const pending = isPending(item.product._id);
  const lineTotal = item.product.price * item.quantity;

  const changeQuantity = async (quantity) => {
    setError("");

    try {
      await updateQuantity(item.product._id, quantity);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update quantity."));
    }
  };

  const remove = async () => {
    setError("");

    try {
      await removeFromCart(item.product._id);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to remove this product."));
    }
  };

  return (
    <article className="grid gap-4 border-b border-line py-6 sm:grid-cols-[112px_minmax(0,1fr)_auto]">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="h-28 w-full rounded-2xl object-cover sm:w-28"
      />
      <div>
        <h2 className="font-display text-2xl">{item.product.name}</h2>
        <p className="mt-1 text-muted">{formatMoney(item.product.price)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-line bg-white px-2 py-1">
            <button
              type="button"
              className="h-8 w-8 rounded-full text-lg disabled:opacity-40"
              onClick={() => changeQuantity(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
            <button
              type="button"
              className="h-8 w-8 rounded-full text-lg disabled:opacity-40"
              onClick={() => changeQuantity(item.quantity + 1)}
              disabled={pending || item.quantity >= item.product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <Button type="button" variant="ghost" onClick={remove} disabled={pending}>
            Remove
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </div>
      <p className="font-semibold sm:text-right">{formatMoney(lineTotal)}</p>
    </article>
  );
}
