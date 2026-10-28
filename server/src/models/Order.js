import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    tone: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 1 },
    quantity: { type: Number, required: true, min: 1, max: 9 },
    personalization: { type: String, default: "", maxlength: 32 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "Add at least one candle."] },
    subtotal: { type: Number, required: true, min: 1 },
    message: { type: String, default: "This was a demo checkout; no payment was collected." },
  },
  { timestamps: true, versionKey: false },
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
