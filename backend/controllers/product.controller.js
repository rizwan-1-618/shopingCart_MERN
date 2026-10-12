import Product from "../models/product.model.js";
import { isBlank, isValidObjectId } from "../utils/validators.js";

const listFields = "name price category image stock";

const sortOptions = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

const readQueryValue = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
  const { name, description, price, category, image, stock } = req.body ?? {};

  if (
    isBlank(name) ||
    isBlank(description) ||
    isBlank(category) ||
    isBlank(image) ||
    price === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "All product fields are required",
    });
  }

  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid price",
    });
  }

  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid stock",
    });
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    image: image.trim(),
    stock,
  });

  return res.status(201).json(product);
};

export const getProducts = async (req, res) => {
  const search = readQueryValue(req.query.search);
  const category = readQueryValue(req.query.category);
  const sort = readQueryValue(req.query.sort);
  const filter = {};

  if (Array.isArray(req.query.search) || Array.isArray(req.query.category) || Array.isArray(req.query.sort)) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
    });
  }

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (category) {
    filter.category = {
      $regex: `^${escapeRegex(category)}$`,
      $options: "i",
    };
  }

  let sortBy = { createdAt: -1 };

  if (sort) {
    sortBy = sortOptions[sort];

    if (!sortBy) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort value",
      });
    }
  }

  const products = await Product.find(filter).select(listFields).sort(sortBy);

  return res.json({
    success: true,
    count: products.length,
    products,
  });
};

export const getProduct = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.json(product);
};

export const getCategories = async (req, res) => {
  const categories = await Product.distinct("category");

  return res.json({
    success: true,
    categories: categories.filter((category) => typeof category === "string" && category.trim()).sort((a, b) => a.localeCompare(b)),
  });
};
