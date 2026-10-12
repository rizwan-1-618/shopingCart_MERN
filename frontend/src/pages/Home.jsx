import { useState } from "react";
import Button from "../components/Button";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";
import { passwordChangeErrors } from "../utils/validation";

export default function Home() {
  const { customer } = useAuth();
  const [values, setValues] = useState({ oldPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = passwordChangeErrors(values);
    setErrors(nextErrors);
    setMessage("");
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.patch("/customers/change-password", values);
      setMessage(data.message);
      setValues({ oldPassword: "", newPassword: "" });
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to change your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] border border-line bg-card p-8">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">Home</p>
        <h1 className="mt-3 font-display text-5xl">Welcome, {customer.fullName}</h1>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-sm text-muted">Customer name</dt>
            <dd className="mt-1 font-semibold">{customer.fullName}</dd>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-sm text-muted">Email</dt>
            <dd className="mt-1 font-semibold">{customer.email}</dd>
          </div>
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-sm text-muted">Phone number</dt>
            <dd className="mt-1 font-semibold">{customer.phone}</dd>
          </div>
        </dl>
        <Button to="/products" className="mt-8">
          Browse products
        </Button>
      </div>
      <form onSubmit={onSubmit} className="rounded-[2rem] border border-line bg-card p-8" noValidate>
        <h2 className="font-display text-3xl">Change password</h2>
        <div className="mt-6 grid gap-4">
          <Field
            id="oldPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={values.oldPassword}
            error={errors.oldPassword}
            onChange={(event) => setValues((current) => ({ ...current, oldPassword: event.target.value }))}
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            error={errors.newPassword}
            onChange={(event) => setValues((current) => ({ ...current, newPassword: event.target.value }))}
          />
        </div>
        {message ? <p className="mt-4 text-sm text-pine">{message}</p> : null}
        {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
        <Button type="submit" className="mt-6" disabled={submitting}>
          {submitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </section>
  );
}
