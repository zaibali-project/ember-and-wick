import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    family: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    notes: { type: [String], required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    burnTime: { type: Number, required: true, min: 1 },
    stockStatus: { type: String, enum: ["in_stock", "sold_out"], default: "in_stock" },
    badge: { type: String, default: "" },
    tone: { type: String, enum: ["clay", "garden", "dusk", "linen"], required: true },
    featuredOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
