import Razorpay from "razorpay";

let client;

export const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 500;
    throw error;
  }

  if (!client) {
    client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return client;
};
