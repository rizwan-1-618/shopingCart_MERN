import "./config/env.js";
import mongoose from "mongoose";
import Product from "./models/product.model.js";

const products = [
  {
    name: "Noise Cancelling Headphones",
    description:
      "Wireless over-ear headphones with active noise cancellation and a 30 hour battery.",
    price: 4999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with tactile blue switches and a full layout.",
    price: 2999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    stock: 10,
  },
  {
    name: "Wireless Mouse",
    description: "Compact wireless mouse with a quiet click and a USB receiver.",
    price: 1499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    stock: 40,
  },
  {
    name: "Linen Overshirt",
    description: "Breathable linen overshirt with a relaxed fit and coconut buttons.",
    price: 2499,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    stock: 15,
  },
  {
    name: "Canvas Tote",
    description: "Heavy canvas tote with an inner pocket and reinforced straps.",
    price: 899,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
    stock: 30,
  },
  {
    name: "The Design of Everyday Things",
    description: "Don Norman's guide to how everyday objects communicate their use.",
    price: 799,
    category: "Books",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
    stock: 20,
  },
  {
    name: "Ceramic Pour-over Set",
    description: "Stoneware dripper and server for a slower morning brew.",
    price: 1899,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    stock: 12,
  },
  {
    name: "Cotton Throw Blanket",
    description: "Washed cotton throw with a loose weave for the sofa or bed.",
    price: 2199,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=80",
    stock: 8,
  },
];

if (!process.env.MONGODB_URI) {
  console.error("Missing required environment variable: MONGODB_URI");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Product.countDocuments();

  if (existing > 0) {
    console.log("Products already exist. Seed skipped.");
  } else {
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
  }
} catch (error) {
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
