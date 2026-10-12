import jwt from "jsonwebtoken";

export const TOKEN_COOKIE = "token";

export const generateToken = (customer) =>
  jwt.sign(
    { id: customer._id, tokenVersion: customer.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});

export const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS),
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE, baseCookieOptions());
};
