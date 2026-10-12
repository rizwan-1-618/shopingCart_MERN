import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { isValidObjectId } from "../utils/validators.js";

const readCart = async (userId) => {
  const customer = await Customer.findById(userId);
  const products = await Product.find({
    _id: { $in: customer.cart.map((item) => item.product) },
  }).select("name price image stock category");
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const hasMissingProduct = customer.cart.some(
    (item) => !productsById.has(item.product.toString())
  );

  if (hasMissingProduct) {
    customer.cart = customer.cart.filter((item) => productsById.has(item.product.toString()));
    await customer.save();
  }

  return customer.cart
    .filter((item) => productsById.has(item.product.toString()))
    .map((item) => {
      const product = productsById.get(item.product.toString());

      return {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: product.category,
        },
        quantity: item.quantity,
      };
    });
};

const rejectInvalidProductId = (productId, res) => {
  if (isValidObjectId(productId)) {
    return false;
  }

  res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });

  return true;
};

export const addToCart = async (req, res) => {
  const { productId } = req.params;

  if (rejectInvalidProductId(productId, res)) {
    return;
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const customer = await Customer.findById(req.user._id);
  const existingItem = customer.cart.find(
    (item) => item.product.toString() === product._id.toString()
  );
  const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;

  if (nextQuantity > product.stock) {
    return res.status(400).json({
      success: false,
      message: "Requested quantity exceeds available stock",
    });
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    customer.cart.push({ product: product._id, quantity: 1 });
  }

  await customer.save();

  return res.json({
    success: true,
    message: "Cart updated",
    cart: await readCart(customer._id),
  });
};

export const getCart = async (req, res) => {
  return res.json({
    success: true,
    cart: await readCart(req.user._id),
  });
};

export const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body ?? {};

  if (rejectInvalidProductId(productId, res)) {
    return;
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a number",
    });
  }

  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (quantity > product.stock) {
    return res.status(400).json({
      success: false,
      message: "Quantity cannot exceed available stock",
    });
  }

  const customer = await Customer.findById(req.user._id);
  const existingItem = customer.cart.find(
    (item) => item.product.toString() === productId
  );

  if (!existingItem) {
    return res.status(404).json({
      success: false,
      message: "Product not in cart",
    });
  }

  existingItem.quantity = quantity;
  await customer.save();

  return res.json({
    success: true,
    message: "Cart updated",
    cart: await readCart(customer._id),
  });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  if (rejectInvalidProductId(productId, res)) {
    return;
  }

  const customer = await Customer.findById(req.user._id);
  const exists = customer.cart.some((item) => item.product.toString() === productId);

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Product not in cart",
    });
  }

  customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
  await customer.save();

  return res.json({
    success: true,
    message: "Product removed from cart",
    cart: await readCart(customer._id),
  });
};
