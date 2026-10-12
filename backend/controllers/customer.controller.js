import Customer from "../models/customer.model.js";
import {
  clearAuthCookie,
  generateToken,
  setAuthCookie,
} from "../utils/generateToken.js";
import { isBlank, isEmail } from "../utils/validators.js";

const toPublicCustomer = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
});

export const registerCustomer = async (req, res) => {
  const { fullName, email, password, phone } = req.body ?? {};

  if (
    isBlank(fullName) ||
    isBlank(email) ||
    typeof password !== "string" ||
    password.length === 0 ||
    isBlank(phone)
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are mandatory",
    });
  }

  if (!isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "A valid email is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingCustomer = await Customer.findOne({ email: normalizedEmail });

  if (existingCustomer) {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  const customer = await Customer.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    phone: phone.trim(),
  });

  return res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    customer: toPublicCustomer(customer),
  });
};

export const loginCustomer = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (isBlank(email) || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!customer) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const passwordMatches = await customer.comparePassword(password);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  setAuthCookie(res, generateToken(customer));

  return res.json({
    success: true,
    message: "Login successful",
  });
};

export const getProfile = async (req, res) => {
  res.json(toPublicCustomer(req.user));
};

export const logoutCustomer = async (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body ?? {};

  if (
    typeof oldPassword !== "string" ||
    oldPassword.length === 0 ||
    typeof newPassword !== "string" ||
    newPassword.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters",
    });
  }

  const customer = await Customer.findById(req.user._id).select("+password");
  const passwordMatches = await customer.comparePassword(oldPassword);

  if (!passwordMatches) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  customer.password = newPassword;
  customer.tokenVersion = (customer.tokenVersion ?? 0) + 1;
  await customer.save();
  setAuthCookie(res, generateToken(customer));

  return res.json({
    success: true,
    message: "Password changed successfully",
  });
};
