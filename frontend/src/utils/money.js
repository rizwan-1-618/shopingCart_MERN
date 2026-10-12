const currency = import.meta.env.VITE_CURRENCY;

if (!currency) {
  throw new Error("VITE_CURRENCY is required");
}

const formatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

export const formatMoney = (amount) => formatter.format(amount);
