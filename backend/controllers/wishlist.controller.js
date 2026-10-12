import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { isValidObjectId } from "../utils/validators.js";

const readWishlist = async (userId) => {
  const customer = await Customer.findById(userId);
  const products = await Product.find({ _id: { $in: customer.wishlist } }).select(
    "name price category image stock"
  );
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const hasMissingProduct = customer.wishlist.some((id) => !productsById.has(id.toString()));

  if (hasMissingProduct) {
    customer.wishlist = customer.wishlist.filter((id) => productsById.has(id.toString()));
    await customer.save();
  }

  return customer.wishlist
    .map((id) => productsById.get(id.toString()))
    .filter(Boolean);
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const customer = await Customer.findById(req.user._id);
  const alreadySaved = customer.wishlist.some(
    (id) => id.toString() === product._id.toString()
  );

  if (alreadySaved) {
    return res.status(409).json({
      success: false,
      message: "Product already in wishlist",
    });
  }

  customer.wishlist.push(product._id);
  await customer.save();

  return res.status(201).json({
    success: true,
    message: "Product added to wishlist",
  });
};

export const getWishlist = async (req, res) => {
  const wishlist = await readWishlist(req.user._id);

  return res.json({
    success: true,
    count: wishlist.length,
    wishlist,
  });
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const customer = await Customer.findById(req.user._id);
  const exists = customer.wishlist.some((id) => id.toString() === productId);

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Product not in wishlist",
    });
  }

  customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
  await customer.save();

  return res.json({
    success: true,
    message: "Product removed from wishlist",
  });
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const product = await Product.findById(productId).select("_id");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const customer = await Customer.findById(req.user._id);
  const alreadySaved = customer.wishlist.some(
    (id) => id.toString() === productId
  );

  if (alreadySaved) {
    customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    await customer.save();

    return res.json({
      success: true,
      saved: false,
      message: "Product removed from wishlist",
    });
  }

  customer.wishlist.push(product._id);
  await customer.save();

  return res.json({
    success: true,
    saved: true,
    message: "Product added to wishlist",
  });
};
