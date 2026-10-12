const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function OrderProgress({ status }) {
  const current = steps.indexOf(status);

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const reached = current >= index;

        return (
          <li key={step}>
            <span className={`mb-2 block h-1.5 rounded-full ${reached ? "bg-pine" : "bg-line"}`} />
            <span className={`text-xs font-semibold tracking-wide ${reached ? "text-pine" : "text-muted"}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
