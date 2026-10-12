import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import OrderProgress from "../components/OrderProgress";
import StatusMessage from "../components/StatusMessage";
import api from "../services/api";
import { formatDate } from "../utils/date";
import { formatMoney } from "../utils/money";

export default function OrderDetails() {
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

  const address = order.shippingAddress;

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
        <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
        <h1 className="mt-2 font-display text-4xl break-all">Order #{order._id}</h1>
        {order.paymentStatus === "PAID" ? (
          <div className="mt-6">
            <OrderProgress status={order.status} />
          </div>
        ) : null}
        <ul className="mt-8 space-y-4">
          {order.items.map((item) => (
            <li key={`${item.product}`} className="flex gap-4">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
              ) : null}
              <div className="flex flex-1 items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">
                    {formatMoney(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="h-fit rounded-[2rem] border border-line bg-card p-6">
        <h2 className="font-display text-3xl">Delivery</h2>
        <p className="mt-4 font-semibold">{address.fullName}</p>
        <p className="mt-2 text-muted">
          {address.addressLine1}
          <br />
          {address.city}, {address.state} {address.pincode}
          <br />
          {address.phone}
        </p>
        <p className="mt-6 text-sm text-muted">Payment</p>
        <p className="font-semibold">{order.paymentStatus}</p>
        <p className="mt-4 text-sm text-muted">Total</p>
        <p className="text-2xl font-semibold">{formatMoney(order.totalAmount)}</p>
        <Button to="/orders" variant="secondary" className="mt-6 w-full">
          View My Orders
        </Button>
      </aside>
    </article>
  );
}
