import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import OrderCard from "../components/OrderCard";
import StatusMessage from "../components/StatusMessage";
import api from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadOrders = useCallback(async () => {
    setStatus("loading");

    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    api
      .get("/orders")
      .then(({ data }) => {
        if (!active) {
          return;
        }

        setOrders(data.orders);
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

  if (status === "loading") {
    return <StatusMessage title="Loading your orders..." />;
  }

  if (status === "error") {
    return (
      <StatusMessage title="Unable to load your orders.">
        <Button type="button" onClick={loadOrders}>
          Try Again
        </Button>
      </StatusMessage>
    );
  }

  if (orders.length === 0) {
    return (
      <StatusMessage title="You have not placed any orders yet.">
        <Button to="/products">Start Shopping</Button>
      </StatusMessage>
    );
  }

  return (
    <section>
      <h1 className="font-display text-5xl">My Orders</h1>
      <div className="mt-8 grid gap-5">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </section>
  );
}
