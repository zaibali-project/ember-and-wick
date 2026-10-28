import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase, createStore } from "./database.js";

try {
  const connectedToMongo = await connectDatabase();
  const store = createStore(connectedToMongo);
  const app = createApp(store, { serveClient: process.env.NODE_ENV === "production" });
  const port = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.info(`Ember & Wick API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Could not start the server:", error.message);
  process.exitCode = 1;
}
