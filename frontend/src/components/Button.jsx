import { Link } from "react-router-dom";

const variants = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60",
};

export const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-accent";

export default function Button({ to, variant = "primary", className = "", ...props }) {
  const classes = `${variants[variant]} ${className}`;

  if (to) {
    return <Link to={to} className={classes} {...props} />;
  }

  return <button className={classes} {...props} />;
}
