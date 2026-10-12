import crypto from "crypto";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpay } from "../config/razorpay.js";
import {
  isValidObjectId,
  normalizeShippingAddress,
  validateShippingAddress,
} from "../utils/validators.js";

const progression = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const sameOwner = (order, userId) => order.user.toString() === userId.toString();

const restoreStock = async (items) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity } }
    );
  }
};

const decrementStock = async (items) => {
  const decremented = [];

  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updated) {
      await restoreStock(decremented);
      const error = new Error(`Insufficient stock for ${item.name}.`);
      error.statusCode = 400;
      throw error;
    }

    decremented.push(item);
  }
};

export const createPaymentOrder = async (req, res) => {
  const addressError = validateShippingAddress(req.body?.shippingAddress);

  if (addressError) {
    return res.status(400).json(addressError);
  }

  const shippingAddress = normalizeShippingAddress(req.body.shippingAddress);
  const customer = await Customer.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image stock",
  });
  const unavailable = customer.cart.some((item) => !item.product);

  if (unavailable) {
    return res.status(400).json({
      success: false,
      message: "A product in your cart is no longer available",
    });
  }

  if (customer.cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  for (const item of customer.cart) {
    if (item.quantity > item.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.product.name}.`,
      });
    }
  }

  const items = customer.cart.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image,
  }));
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: customer._id,
    items,
    shippingAddress,
    totalAmount,
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
  });

  try {
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: process.env.CURRENCY,
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    order.paymentStatus = "FAILED";
    await order.save();

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);
    return res.status(502).json({
      success: false,
      message: "Unable to start payment",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    shopKartOrderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body ?? {};

  if (!isValidObjectId(shopKartOrderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order id",
    });
  }

  if (
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof razorpaySignature !== "string" ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment verification details are required",
    });
  }

  const order = await Order.findById(shopKartOrderId);

  if (!order || !sameOwner(order, req.user._id)) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus === "PAID") {
    return res.json({
      success: true,
      message: "Payment already verified",
      order,
    });
  }

  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({
      success: false,
      message: "Payment order mismatch",
    });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "Razorpay is not configured",
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(razorpaySignature);
  const signatureMatches =
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer);

  if (!signatureMatches) {
    await Order.updateOne(
      { _id: order._id, paymentStatus: "PENDING" },
      { paymentStatus: "FAILED" }
    );

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  }

  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, user: req.user._id, paymentStatus: "PENDING" },
    {
      paymentStatus: "PAID",
      status: "PLACED",
      razorpayPaymentId,
    },
    { new: true }
  );

  if (!claimed) {
    const current = await Order.findById(order._id);

    if (current?.paymentStatus === "PAID" && sameOwner(current, req.user._id)) {
      return res.json({
        success: true,
        message: "Payment already verified",
        order: current,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Order cannot be verified",
    });
  }

  try {
    await decrementStock(claimed.items);

    try {
      await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    } catch (clearError) {
      await restoreStock(claimed.items);
      throw clearError;
    }

    return res.json({
      success: true,
      message: "Payment verified",
      order: claimed,
    });
  } catch (error) {
    claimed.paymentStatus = "FAILED";
    claimed.status = "PENDING_PAYMENT";
    claimed.razorpayPaymentId = undefined;
    await claimed.save();

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to confirm order",
    });
  }
};

export const markPaymentFailed = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order id",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order || !sameOwner(order, req.user._id)) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus === "PENDING") {
    order.paymentStatus = "FAILED";
    await order.save();
  }

  return res.json({
    success: true,
    order,
  });
};

export const getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  return res.json({
    success: true,
    orders,
  });
};

export const getOrder = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order id",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order || !sameOwner(order, req.user._id)) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  return res.json({
    success: true,
    order,
  });
};

export const updateOrderStatus = async (req, res) => {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return res.status(503).json({
      success: false,
      message: "Order status updates are not configured",
    });
  }

  const providedKey = req.get("x-admin-key") || "";
  const providedBuffer = Buffer.from(providedKey);
  const adminBuffer = Buffer.from(adminKey);
  const authorized =
    providedBuffer.length === adminBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, adminBuffer);

  if (!authorized) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order id",
    });
  }

  const { status } = req.body ?? {};

  if (typeof status !== "string" || !progression.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "PAID") {
    return res.status(400).json({
      success: false,
      message: "Only paid orders can change status",
    });
  }

  const currentIndex = progression.indexOf(order.status);
  const nextIndex = progression.indexOf(status);

  if (nextIndex !== currentIndex + 1) {
    return res.status(400).json({
      success: false,
      message: "Status can only move one step forward",
    });
  }

  order.status = status;
  await order.save();

  return res.json({
    success: true,
    order,
  });
};
