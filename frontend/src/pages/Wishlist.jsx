import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import WishlistCard from "../components/WishlistCard";
import api from "../services/api";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadWishlist = useCallback(async () => {
    setStatus("loading");

    try {
      const { data } = await api.get("/wishlist");
      setProducts(data.wishlist);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    api
      .get("/wishlist")
      .then(({ data }) => {
        if (!active) {
          return;
        }

        setProducts(data.wishlist);
        setStatus("ready");
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const onRemoved = (productId) => {
    setProducts((current) => current.filter((product) => product._id !== productId));
  };

  if (status === "loading") {
    return <StatusMessage title="Loading your wishlist..." />;
  }

  if (status === "error") {
    return (
      <StatusMessage title="Unable to load wishlist." description="Something went wrong. We couldn't load your wishlist.">
        <Button type="button" onClick={loadWishlist}>
          Try Again
        </Button>
      </StatusMessage>
    );
  }

  if (products.length === 0) {
    return (
      <StatusMessage
        title="Your wishlist is empty ❤️"
        description="Start saving products you love."
      >
        <Button to="/products">Browse Products</Button>
      </StatusMessage>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="font-display text-5xl">My Wishlist</h1>
        <p className="mt-2 text-muted">
          {products.length} {products.length === 1 ? "product" : "products"} saved
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <WishlistCard key={product._id} product={product} onRemoved={onRemoved} />
        ))}
      </div>
    </section>
  );
}
