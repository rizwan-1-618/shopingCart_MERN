import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import StatusMessage from "../components/StatusMessage";
import api from "../services/api";
import { formatMoney } from "../utils/money";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        if (active) {
          setOrder(data.order);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return <StatusMessage title="Loading your order..." />;
  }

  if (status === "error" || !order) {
    return (
      <StatusMessage title="Unable to load your order.">
        <Button to="/orders">View My Orders</Button>
      </StatusMessage>
    );
  }

  return (
    <StatusMessage
      title={order.paymentStatus === "PAID" ? "Order Placed Successfully" : "Payment was not completed"}
      description={
        order.paymentStatus === "PAID"
          ? "Your order has been saved successfully."
          : "Your cart has not been cleared."
      }
    >
      <div className="w-full rounded-3xl bg-paper p-5 text-left">
        <p className="text-sm text-muted">Order ID</p>
        <p className="mt-1 font-semibold break-all">{order._id}</p>
        <p className="mt-4 text-sm text-muted">Total</p>
        <p className="mt-1 font-semibold">{formatMoney(order.totalAmount)}</p>
        <p className="mt-4 text-sm text-muted">Status</p>
        <p className="mt-1 font-semibold">{order.status}</p>
      </div>
      <Button to="/orders">View My Orders</Button>
      <Button to="/products" variant="secondary">
        Continue Shopping
      </Button>
    </StatusMessage>
  );
}
