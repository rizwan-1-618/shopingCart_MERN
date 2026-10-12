import { useState } from "react";
import { useCart } from "../context/CartContext";
import api, { getErrorMessage } from "../services/api";
import { notifyWishlistChanged } from "../services/wishlistEvents";
import { formatMoney } from "../utils/money";
import { stockLabel } from "../utils/stock";
import Button from "./Button";

export default function WishlistCard({ product, onRemoved }) {
  const { addToCart, isInCart, isPending } = useCart();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const cartPending = isPending(product._id);

  const remove = async () => {
    if (removing) {
      return;
    }

    setRemoving(true);
    setError("");

    try {
      await api.delete(`/wishlist/${product._id}`);
      notifyWishlistChanged();
      onRemoved(product._id);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to remove this product."));
      setRemoving(false);
    }
  };

  const onAddToCart = async () => {
    setError("");

    try {
      await addToCart(product._id);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add this product to your cart."));
    }
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-card">
      <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-muted">{product.category}</p>
          <h2 className="mt-1 font-display text-2xl">{product.name}</h2>
        </div>
        <p className="text-lg font-semibold">{formatMoney(product.price)}</p>
        <p className={product.stock <= 0 ? "text-sm text-danger" : "text-sm text-pine"}>
          {stockLabel(product.stock)}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Button to={`/products/${product._id}`} variant="secondary">
            View Details
          </Button>
          <Button type="button" onClick={onAddToCart} disabled={cartPending || product.stock <= 0}>
            {cartPending ? "Adding..." : isInCart(product._id) ? "Add Another" : "Add to Cart"}
          </Button>
          <Button type="button" variant="secondary" onClick={remove} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </Button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </div>
    </article>
  );
}
