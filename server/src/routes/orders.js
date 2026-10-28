import { randomUUID } from "node:crypto";
import { Router } from "express";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ORDER_LINES = 12;

export function createOrderRouter(store) {
  const router = Router();

  router.post("/", async (request, response, next) => {
    try {
      const { email, items } = request.body ?? {};

      if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim()) || email.length > 254) {
        return response.status(400).json({ error: "Please enter a valid email address." });
      }

      if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ORDER_LINES) {
        return response.status(400).json({ error: "Add between one and twelve different candles to your bag." });
      }

      const submittedSlugs = new Set();
      for (const item of items) {
        if (
          !item ||
          typeof item.slug !== "string" ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
          submittedSlugs.has(item.slug) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 9 ||
          (item.personalization !== undefined &&
            (typeof item.personalization !== "string" || item.personalization.trim().length > 32))
        ) {
          return response.status(400).json({ error: "One of those candles has invalid details. Please check your bag." });
        }
        submittedSlugs.add(item.slug);
      }

      const products = await store.getProductsBySlugs([...submittedSlugs]);
      if (products.length !== submittedSlugs.size) {
        return response.status(400).json({ error: "We couldn't find one of the candles in your bag. Please refresh and try again." });
      }

      const productBySlug = new Map(products.map((product) => [product.slug, product]));
      const unavailableItem = items.find((item) => productBySlug.get(item.slug).stockStatus !== "in_stock");
      if (unavailableItem) {
        return response.status(409).json({ error: "One of those candles has just sold out. Please update your bag." });
      }

      const orderItems = items.map((item) => {
        const product = productBySlug.get(item.slug);
        return {
          slug: product.slug,
          name: product.name,
          size: product.size,
          tone: product.tone,
          unitPrice: product.price,
          quantity: item.quantity,
          personalization: item.personalization?.trim() ?? "",
        };
      });

      const order = await store.createOrder({
        reference: `EW-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
        email: email.trim().toLowerCase(),
        items: orderItems,
        subtotal: orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        message: "This was a demo checkout; no payment was collected.",
      });

      return response.status(201).json({
        order: {
          reference: order.reference,
          subtotal: order.subtotal,
          message: order.message,
        },
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
