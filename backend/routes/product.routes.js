import { Router } from "express";
import {
  createProduct,
  getCategories,
  getProduct,
  getProducts,
} from "../controllers/product.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(createProduct));
router.get("/categories", asyncHandler(getCategories));
router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProduct));

export default router;
