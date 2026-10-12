import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import StatusMessage from "../components/StatusMessage";
import { useCart } from "../context/CartContext";
import api, { getErrorMessage } from "../services/api";
import { loadRazorpayScript } from "../services/razorpay";
import { checkoutErrors } from "../utils/validation";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart();
  const [address, setAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (name, value) => {
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    const nextErrors = checkoutErrors(address);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          addressLine1: address.addressLine1.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
      });
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        setFormError("Unable to load payment checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      let settled = false;
      const payment = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          settled = true;

          try {
            const verified = await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshCart();
            navigate(`/order-success/${verified.data.order._id}`);
          } catch (verifyError) {
            setFormError(
              getErrorMessage(
                verifyError,
                "Payment verification failed. Your cart has not been cleared."
              )
            );
            setSubmitting(false);
          }
        },
        prefill: {
          name: address.fullName.trim(),
          contact: address.phone.trim(),
        },
        modal: {
          ondismiss() {
            if (settled) {
              return;
            }

            setFormError("Payment was not completed. Your cart has not been cleared. Please try again.");
            setSubmitting(false);
          },
        },
        theme: {
          color: "#b8431f",
        },
      });

      payment.on("payment.failed", async () => {
        settled = true;

        try {
          await api.post(`/orders/${data.shopKartOrderId}/payment-failed`);
        } catch {
          setFormError("Payment failed. Your cart has not been cleared. Please try again.");
          setSubmitting(false);
          return;
        }

        setFormError("Payment failed. Your cart has not been cleared. Please try again.");
        setSubmitting(false);
      });

      payment.open();
    } catch (orderError) {
      if (orderError.response?.data?.errors) {
        setErrors(orderError.response.data.errors);
      }

      setFormError(getErrorMessage(orderError, "Unable to place the order."));
      setSubmitting(false);
    }
  };

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
      <StatusMessage title="Your cart is empty 🛒" description="Add something before checking out.">
        <Button to="/products">Browse Products</Button>
      </StatusMessage>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate>
      <section className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
        <h1 className="font-display text-5xl">Checkout</h1>
        <h2 className="mt-8 font-display text-3xl">Shipping Details</h2>
        <div className="mt-6">
          <CheckoutForm values={address} errors={errors} onChange={onChange} />
        </div>
        {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
      </section>
      <OrderSummary items={cartItems} totalUnits={totalUnits} subtotal={subtotal} totalLabel="Total">
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Placing order..." : "Place Order"}
        </Button>
      </OrderSummary>
    </form>
  );
}
