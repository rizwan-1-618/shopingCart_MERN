import mongoose from "mongoose";

export const isValidObjectId = (id) => {
  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  return new mongoose.Types.ObjectId(id).toString() === id;
};

export const isBlank = (value) =>
  typeof value !== "string" || value.trim() === "";

export const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isTenDigitPhone = (value) =>
  typeof value === "string" && /^\d{10}$/.test(value.trim());

export const isSixDigitPincode = (value) =>
  typeof value === "string" && /^\d{6}$/.test(value.trim());

const addressFields = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "state",
  "pincode",
];

export const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return {
      success: false,
      message: "Shipping address is required",
    };
  }

  const errors = {};

  for (const field of addressFields) {
    if (isBlank(address[field])) {
      errors[field] = "This field is required";
    }
  }

  if (!errors.phone && !isTenDigitPhone(address.phone)) {
    errors.phone = "Phone must contain a valid 10 digit number";
  }

  if (!errors.pincode && !isSixDigitPincode(address.pincode)) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: Object.values(errors)[0],
      errors,
    };
  }

  return null;
};

export const normalizeShippingAddress = (address) => ({
  fullName: address.fullName.trim(),
  phone: address.phone.trim(),
  addressLine1: address.addressLine1.trim(),
  city: address.city.trim(),
  state: address.state.trim(),
  pincode: address.pincode.trim(),
});
