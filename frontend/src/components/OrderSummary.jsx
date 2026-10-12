import { formatMoney } from "../utils/money";

export default function OrderSummary({ items, totalUnits, subtotal, totalLabel = "Subtotal", children }) {
  return (
    <aside className="h-fit rounded-[1.75rem] border border-line bg-card p-6">
      <h2 className="font-display text-3xl">Order Summary</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.product._id} className="flex items-start justify-between gap-4 text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span className="font-semibold">
              {formatMoney(item.product.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-line pt-4">
        <p className="flex justify-between">
          <span>Items</span>
          <span className="font-semibold">{totalUnits}</span>
        </p>
        <p className="flex justify-between text-lg">
          <span>{totalLabel}</span>
          <span className="font-semibold">{formatMoney(subtotal)}</span>
        </p>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </aside>
  );
}
