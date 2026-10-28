import { Router } from "express";

export function createProductRouter(store) {
  const router = Router();

  router.get("/", async (_request, response, next) => {
    try {
      const products = await store.getProducts();
      response.json({ products });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
