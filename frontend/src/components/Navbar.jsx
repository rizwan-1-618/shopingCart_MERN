import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api, { getErrorMessage } from "../services/api";
import { subscribeWishlist } from "../services/wishlistEvents";
import Button from "./Button";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-ink hover:bg-white"
  }`;

export default function Navbar() {
  const { customer, logout } = useAuth();
  const { totalUnits } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!customer) {
      return undefined;
    }

    let active = true;

    const loadCount = () =>
      api
        .get("/wishlist")
        .then(({ data }) => {
          if (active) {
            setWishlistCount(data.count);
          }
        })
        .catch(() => {
          if (active) {
            setWishlistCount(0);
          }
        });

    loadCount();
    const unsubscribe = subscribeWishlist(loadCount);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [customer]);

  const onLogout = async () => {
    setLogoutError("");

    try {
      await logout();
      setOpen(false);
      navigate("/login");
    } catch (error) {
      setLogoutError(getErrorMessage(error, "Unable to log out."));
    }
  };

  const links = customer
    ? [
        { to: "/home", label: "Home" },
        { to: "/products", label: "Products" },
        { to: "/wishlist", label: `Wishlist (${customer ? wishlistCount : 0})` },
        { to: "/cart", label: `Cart (${totalUnits})` },
        { to: "/orders", label: "Orders" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NavLink to={customer ? "/products" : "/login"} className="font-display text-2xl text-ink">
          ShopKart
        </NavLink>
        <button
          type="button"
          className="rounded-full border border-line px-3 py-2 text-sm font-semibold md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          Menu
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {customer ? (
            <Button type="button" variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          ) : null}
        </nav>
      </div>
      {open ? (
        <nav className="flex flex-col gap-2 px-4 pb-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {customer ? (
            <Button type="button" variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          ) : null}
        </nav>
      ) : null}
      {logoutError ? <p className="px-4 pb-3 text-sm text-danger sm:px-6">{logoutError}</p> : null}
    </header>
  );
}
