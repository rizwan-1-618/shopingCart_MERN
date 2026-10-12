import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import { useCart } from "../context/CartContext";
import api, { getErrorMessage } from "../services/api";
import { notifyWishlistChanged } from "../services/wishlistEvents";
import { formatMoney } from "../utils/money";
import { stockLabel } from "../utils/stock";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, isInCart, isPending } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saved, setSaved] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setProduct(null);
    setError("");

    Promise.all([
      api.get(`/products/${id}`, { signal: controller.signal }),
      api.get("/wishlist", { signal: controller.signal }),
    ])
      .then(([productResponse, wishlistResponse]) => {
        setProduct(productResponse.data);
        setSaved(wishlistResponse.data.wishlist.some((item) => item._id === productResponse.data._id));
        setStatus("ready");
      })
      .catch((err) => {
        if (err.code === "ERR_CANCELED") {
          return;
        }

        setError(err.response?.status === 404 ? "Product not found." : "Something went wrong while loading products.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [id]);

  const toggleWishlist = async () => {
    if (!product || wishlistPending) {
      return;
    }

    setWishlistPending(true);
    setError("");

    try {
      const { data } = await api.patch(`/wishlist/${product._id}/toggle`);
      setSaved(data.saved);
      notifyWishlistChanged();
    } catch {
      setError("Unable to save product. Please try again.");
    } finally {
      setWishlistPending(false);
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

  if (status === "loading") {
    return <StatusMessage title="Loading products..." />;
  }

  if (status === "error" || !product) {
    return (
      <StatusMessage title={error || "Something went wrong while loading products."}>
        <Button to="/products">Browse Products</Button>
      </StatusMessage>
    );
  }

  const cartPending = isPending(product._id);

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <img src={product.image} alt={product.name} className="w-full rounded-[2rem] object-cover" />
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">{product.category}</p>
        <h1 className="mt-3 font-display text-5xl">{product.name}</h1>
        <p className="mt-4 text-lg text-muted">{product.description}</p>
        <p className="mt-6 text-3xl font-semibold">{formatMoney(product.price)}</p>
        <p className={`mt-2 ${product.stock <= 0 ? "text-danger" : "text-pine"}`}>{stockLabel(product.stock)}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={onAddToCart} disabled={cartPending || product.stock <= 0}>
            {cartPending ? "Adding..." : isInCart(product._id) ? "Add Another" : "Add to Cart"}
          </Button>
          <Button type="button" variant="secondary" onClick={toggleWishlist} disabled={wishlistPending}>
            {wishlistPending ? "Saving..." : saved ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    </article>
  );
}
