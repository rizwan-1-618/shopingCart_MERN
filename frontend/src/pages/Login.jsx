import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { refreshCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (email.trim() === "" || password.length === 0) {
      setError("Email and password are required");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/customers/login", { email: email.trim(), password });
      await refreshCustomer();
      navigate("/home");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid Credentials");
      } else {
        setError(getErrorMessage(err, "Unable to log in."));
      }
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">ShopKart</p>
        <h1 className="mt-3 font-display text-5xl">Welcome back</h1>
        <p className="mt-4 max-w-md text-muted">
          Sign in to open your home page, catalogue, wishlist, and cart.
        </p>
      </div>
      <form onSubmit={onSubmit} className="rounded-[2rem] border border-line bg-card p-6 sm:p-8" noValidate>
        <div className="grid gap-4">
          <Field id="email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          <Field id="password" label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </Button>
        <p className="mt-4 text-sm text-muted">
          New to ShopKart?{" "}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}
