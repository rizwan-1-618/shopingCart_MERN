import Button from "../components/Button";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import StatusMessage from "../components/StatusMessage";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart();

  if (loading && cartItems.length === 0) {
    return <StatusMessage title="Loading your cart..." />;
  }

  if (error && cartItems.length === 0) {
    return (
      <StatusMessage title="Unable to load your cart.">
        <Button type="button" onClick={() => refreshCart().catch(() => {})}>
          Try Again
        </Button>
      </StatusMessage>
    );
  }

  if (cartItems.length === 0) {
    return (
      <StatusMessage
        title="Your cart is empty 🛒"
        description="Looks like you haven't added anything yet."
      >
        <Button to="/products">Browse Products</Button>
      </StatusMessage>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <h1 className="font-display text-5xl">My Cart</h1>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-4">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>
      </div>
      <OrderSummary items={cartItems} totalUnits={totalUnits} subtotal={subtotal}>
        <Button to="/checkout" className="w-full">
          Proceed to Checkout
        </Button>
      </OrderSummary>
    </section>
  );
}
