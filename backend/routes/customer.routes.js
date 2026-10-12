import { Router } from "express";
import {
  changePassword,
  getProfile,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "../controllers/customer.controller.js";
import protect from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(registerCustomer));
router.post("/login", asyncHandler(loginCustomer));
router.get("/me", protect, asyncHandler(getProfile));
router.post("/logout", protect, asyncHandler(logoutCustomer));
router.patch("/change-password", protect, asyncHandler(changePassword));

export default router;
