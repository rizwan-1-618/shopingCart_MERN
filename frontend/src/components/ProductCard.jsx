import { useState } from "react";
import { useCart } from "../context/CartContext";
import api, { getErrorMessage } from "../services/api";
import { notifyWishlistChanged } from "../services/wishlistEvents";
import { formatMoney } from "../utils/money";
import { stockLabel } from "../utils/stock";
import Button from "./Button";

export default function ProductCard({ product, initiallySaved = false, onSavedChange }) {
  const { addToCart, isInCart, isPending } = useCart();
  const [saved, setSaved] = useState(initiallySaved);
  const [trackedSaved, setTrackedSaved] = useState(initiallySaved);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [cartError, setCartError] = useState("");
  const cartPending = isPending(product._id);
  const inCart = isInCart(product._id);
  const outOfStock = product.stock <= 0;

  if (initiallySaved !== trackedSaved) {
    setTrackedSaved(initiallySaved);
    setSaved(initiallySaved);
  }

  const toggleWishlist = async () => {
    if (wishlistPending) {
      return;
    }

    setWishlistPending(true);
    setWishlistError("");

    try {
      const { data } = await api.patch(`/wishlist/${product._id}/toggle`);
      setSaved(data.saved);
      onSavedChange?.(product._id, data.saved);
      notifyWishlistChanged();
    } catch {
      setWishlistError("Unable to save product. Please try again.");
    } finally {
      setWishlistPending(false);
    }
  };

  const onAddToCart = async () => {
    setCartError("");

    try {
      await addToCart(product._id);
    } catch (error) {
      setCartError(getErrorMessage(error, "Unable to add this product to your cart."));
    }
  };

  const wishlistLabel = wishlistPending
    ? "Saving..."
    : saved
      ? "♥ Remove from Wishlist"
      : "♡ Add to Wishlist";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-card">
      <div className="relative">
        <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistPending}
          aria-label={saved ? "Remove from Wishlist" : "Add to Wishlist"}
          className="absolute top-3 right-3 rounded-full bg-card/95 px-3 py-2 text-sm font-semibold text-accent shadow-sm disabled:opacity-60"
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-muted">{product.category}</p>
          <h2 className="mt-1 font-display text-2xl text-ink">{product.name}</h2>
        </div>
        <p className="text-lg font-semibold">{formatMoney(product.price)}</p>
        <p className={outOfStock ? "text-sm text-danger" : "text-sm text-pine"}>
          {stockLabel(product.stock)}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Button to={`/products/${product._id}`} variant="secondary">
            View Details
          </Button>
          <Button type="button" onClick={toggleWishlist} disabled={wishlistPending} variant="secondary">
            {wishlistLabel}
          </Button>
          <Button type="button" onClick={onAddToCart} disabled={cartPending || outOfStock}>
            {cartPending ? "Adding..." : inCart ? "Add Another" : "Add to Cart"}
          </Button>
          {wishlistError ? <p className="text-sm text-danger">{wishlistError}</p> : null}
          {cartError ? <p className="text-sm text-danger">{cartError}</p> : null}
        </div>
      </div>
    </article>
  );
}
