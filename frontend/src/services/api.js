import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is required");
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
};

export default api;
