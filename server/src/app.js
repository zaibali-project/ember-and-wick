import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOrderRouter } from "./routes/orders.js";
import { createProductRouter } from "./routes/products.js";

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");

export function createApp(store, { serveClient = false } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/products", createProductRouter(store));
  app.use("/api/orders", createOrderRouter(store));

  if (serveClient) {
    app.use(express.static(clientDist, { index: false, maxAge: "1h" }));
    app.get("*", (request, response) => {
      if (request.path.startsWith("/api/")) {
        return response.status(404).json({ error: "That API endpoint was not found." });
      }
      return response.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.parse.failed") {
      return response.status(400).json({ error: "Please send valid JSON." });
    }
    console.error("Request failed:", error);
    return response.status(500).json({ error: "We couldn't complete that request. Please try again." });
  });

  return app;
}
