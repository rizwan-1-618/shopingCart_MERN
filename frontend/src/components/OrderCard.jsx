import { formatDate } from "../utils/date";
import { formatMoney } from "../utils/money";
import Button from "./Button";
import OrderProgress from "./OrderProgress";

export default function OrderCard({ order }) {
  return (
    <article className="rounded-[1.75rem] border border-line bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Order #{order._id}</h2>
          <p className="mt-1 text-sm text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <p className="rounded-full bg-paper px-3 py-1 text-sm font-semibold">{order.paymentStatus}</p>
      </div>
      <ul className="mt-5 space-y-2">
        {order.items.map((item) => (
          <li key={`${order._id}-${item.product}`} className="flex justify-between gap-4">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {order.paymentStatus === "PAID" ? (
        <div className="mt-5">
          <OrderProgress status={order.status} />
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">Total: {formatMoney(order.totalAmount)}</p>
        <Button to={`/orders/${order._id}`} variant="secondary">
          View Details
        </Button>
      </div>
    </article>
  );
}
