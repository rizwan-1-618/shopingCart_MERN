import { inputClass } from "./Button";

export default function Field({ id, label, error, ...props }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <input id={id} className={inputClass} {...props} />
      {error ? <span className="mt-2 block text-sm text-danger">{error}</span> : null}
    </label>
  );
}
