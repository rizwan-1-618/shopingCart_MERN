import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Field from "../components/Field";
import api, { getErrorMessage } from "../services/api";
import { registerErrors } from "../utils/validation";

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = registerErrors(values);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/customers/register", {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim(),
      });
      navigate("/login");
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to create your account."));
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">ShopKart</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Create your account</h1>
        <p className="mt-4 max-w-md text-muted">
          Register once, then browse the catalogue, save pieces, and check out when you are ready.
        </p>
      </div>
      <form onSubmit={onSubmit} className="rounded-[2rem] border border-line bg-card p-6 sm:p-8" noValidate>
        <div className="grid gap-4">
          <Field id="fullName" name="fullName" label="Full Name" value={values.fullName} onChange={onChange} error={errors.fullName} autoComplete="name" />
          <Field id="email" name="email" type="email" label="Email" value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />
          <Field id="password" name="password" type="password" label="Password" value={values.password} onChange={onChange} error={errors.password} autoComplete="new-password" />
          <Field id="phone" name="phone" label="Phone Number" value={values.phone} onChange={onChange} error={errors.phone} autoComplete="tel" inputMode="numeric" />
        </div>
        {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </Button>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}
