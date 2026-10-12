import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState({});

  const refreshCart = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const { data } = await api.get("/cart");
      setCartItems(data.cart);
      setOwnerId(customer?._id ?? null);
      setStatus("ready");
      return data.cart;
    } catch (err) {
      const message = getErrorMessage(err, "Unable to load your cart.");
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [customer]);

  useEffect(() => {
    if (!customer) {
      return undefined;
    }

    let active = true;

    const load = async () => {
      setStatus("loading");
      setError("");

      try {
        const { data } = await api.get("/cart");

        if (active) {
          setCartItems(data.cart);
          setOwnerId(customer._id);
          setStatus("ready");
        }
      } catch (err) {
        if (active) {
          setCartItems([]);
          setOwnerId(customer._id);
          setError(getErrorMessage(err, "Unable to load your cart."));
          setStatus("error");
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [customer]);

  const runForProduct = useCallback(async (productId, task) => {
    setPendingIds((current) => ({ ...current, [productId]: true }));

    try {
      await task();
    } finally {
      setPendingIds((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
    }
  }, []);

  const addToCart = useCallback(
    (productId) =>
      runForProduct(productId, async () => {
        const { data } = await api.post(`/cart/${productId}`);
        setCartItems(data.cart);
        setStatus("ready");
        setError("");
      }),
    [runForProduct]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      runForProduct(productId, async () => {
        const { data } = await api.patch(`/cart/${productId}`, { quantity });
        setCartItems(data.cart);
        setStatus("ready");
        setError("");
      }),
    [runForProduct]
  );

  const removeFromCart = useCallback(
    (productId) =>
      runForProduct(productId, async () => {
        const { data } = await api.delete(`/cart/${productId}`);
        setCartItems(data.cart);
        setStatus("ready");
        setError("");
      }),
    [runForProduct]
  );

  const customerId = customer?._id ?? null;
  const synced = ownerId === customerId;
  const visibleItems = synced ? cartItems : [];
  const totalUnits = visibleItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = visibleItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const loading = Boolean(customerId) && (!synced || status === "loading");

  const value = useMemo(
    () => ({
      cartItems: visibleItems,
      loading,
      error,
      totalUnits,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      isInCart: (productId) =>
        visibleItems.some((item) => String(item.product._id) === String(productId)),
      isPending: (productId) => Boolean(pendingIds[productId]),
    }),
    [
      visibleItems,
      loading,
      error,
      totalUnits,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      pendingIds,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
