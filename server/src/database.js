import mongoose from "mongoose";
import { sampleProducts } from "./data/products.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is unset. Using an in-memory sample catalog; demo orders will not persist across restarts.");
    return false;
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const existingProducts = await Product.countDocuments();

  if (existingProducts === 0) {
    await Product.insertMany(sampleProducts.map(({ _id, ...product }) => product));
    console.info("Sample candle collection added to the empty MongoDB database.");
  }

  console.info("Connected to MongoDB.");
  return true;
}

export function createStore(useMongo) {
  const inMemoryOrders = [];

  return {
    async getProducts() {
      return useMongo
        ? Product.find({}).sort({ featuredOrder: 1 }).lean()
        : sampleProducts;
    },

    async getProductsBySlugs(slugs) {
      return useMongo
        ? Product.find({ slug: { $in: slugs } }).lean()
        : sampleProducts.filter((product) => slugs.includes(product.slug));
    },

    async createOrder(order) {
      if (useMongo) return Order.create(order);
      inMemoryOrders.push(order);
      return order;
    },
  };
}
