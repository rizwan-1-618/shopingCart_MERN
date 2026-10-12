import { Router } from "express";
import {
  createPaymentOrder,
  getOrder,
  getOrders,
  markPaymentFailed,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/order.controller.js";
import protect from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/create-payment-order", protect, asyncHandler(createPaymentOrder));
router.post("/verify-payment", protect, asyncHandler(verifyPayment));
router.post("/:id/payment-failed", protect, asyncHandler(markPaymentFailed));
router.patch("/:id/status", asyncHandler(updateOrderStatus));
router.get("/", protect, asyncHandler(getOrders));
router.get("/:id", protect, asyncHandler(getOrder));

export default router;
