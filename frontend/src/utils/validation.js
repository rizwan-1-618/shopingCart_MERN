const isBlank = (value) => typeof value !== "string" || value.trim() === "";

export const registerErrors = (values) => {
  const errors = {};

  if (isBlank(values.fullName)) {
    errors.fullName = "Full name is required";
  }

  if (isBlank(values.email)) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (typeof values.password !== "string" || values.password.length === 0) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must contain at least 6 characters";
  }

  if (isBlank(values.phone)) {
    errors.phone = "Phone number is required";
  }

  return errors;
};

export const checkoutErrors = (values) => {
  const errors = {};
  const requiredFields = [
    ["fullName", "Full name is required"],
    ["phone", "Phone number is required"],
    ["addressLine1", "Address is required"],
    ["city", "City is required"],
    ["state", "State is required"],
    ["pincode", "Pincode is required"],
  ];

  for (const [field, message] of requiredFields) {
    if (isBlank(values[field])) {
      errors[field] = message;
    }
  }

  if (!errors.phone && !/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Phone must contain a valid 10 digit number";
  }

  if (!errors.pincode && !/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

export const passwordChangeErrors = (values) => {
  const errors = {};

  if (typeof values.oldPassword !== "string" || values.oldPassword.length === 0) {
    errors.oldPassword = "Current password is required";
  }

  if (typeof values.newPassword !== "string" || values.newPassword.length === 0) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "Password must contain at least 6 characters";
  }

  return errors;
};
