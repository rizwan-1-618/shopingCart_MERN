import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import StatusMessage from "../components/StatusMessage";
import Button from "../components/Button";
import api from "../services/api";
import { subscribeWishlist } from "../services/wishlistEvents";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    api
      .get("/products/categories")
      .then(({ data }) => {
        if (active) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSaved = () =>
      api
        .get("/wishlist")
        .then(({ data }) => {
          if (active) {
            setSavedIds(data.wishlist.map((product) => product._id));
          }
        })
        .catch(() => {
          if (active) {
            setSavedIds([]);
          }
        });

    loadSaved();
    const unsubscribe = subscribeWishlist(loadSaved);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category) {
      params.set("category", category);
    }

    if (sort) {
      params.set("sort", sort);
    }

    const query = params.toString();
    setStatus("loading");

    api
      .get(query ? `/products?${query}` : "/products", { signal: controller.signal })
      .then(({ data }) => {
        setProducts(data.products);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") {
          return;
        }

        setStatus("error");
      });

    return () => controller.abort();
  }, [search, category, sort, reloadKey]);

  const onSavedChange = (productId, saved) => {
    setSavedIds((current) =>
      saved ? [...new Set([...current, productId])] : current.filter((id) => id !== productId)
    );
  };

  return (
    <section>
      <div className="mb-8 flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">Catalogue</p>
          <h1 className="mt-2 font-display text-5xl">Products</h1>
        </div>
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
      </div>
      {status === "loading" ? <StatusMessage title="Loading products..." /> : null}
      {status === "error" ? (
        <StatusMessage title="Something went wrong while loading products.">
          <Button type="button" onClick={() => setReloadKey((current) => current + 1)}>
            Try Again
          </Button>
        </StatusMessage>
      ) : null}
      {status === "ready" && products.length === 0 ? <StatusMessage title="No products found." /> : null}
      {status === "ready" && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initiallySaved={savedIds.includes(product._id)}
              onSavedChange={onSavedChange}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
