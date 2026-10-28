import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createApp } from "../src/app.js";
import { sampleProducts } from "../src/data/products.js";

const activeServers = new Set();

async function startTestServer() {
  const orders = [];
  const store = {
    async getProducts() { return sampleProducts; },
    async getProductsBySlugs(slugs) { return sampleProducts.filter((product) => slugs.includes(product.slug)); },
    async createOrder(order) { orders.push(order); return order; },
  };
  const server = createApp(store).listen(0);
  activeServers.add(server);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  return { baseUrl: `http://127.0.0.1:${port}`, orders };
}

afterEach(async () => {
  await Promise.all([...activeServers].map((server) => new Promise((resolve) => server.close(resolve))));
  activeServers.clear();
});

test("health and product collection endpoints respond with original sample products", async () => {
  const { baseUrl } = await startTestServer();

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.products.length, 4);
  assert.equal(body.products[0].slug, "clay-and-cedar");
});

test("checkout ignores client price and stores a server-priced demo order", async () => {
  const { baseUrl, orders } = await startTestServer();
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "  candle@example.com ",
      items: [{ slug: "clay-and-cedar", quantity: 2, price: 1, personalization: "  For a friend  " }],
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.match(body.order.reference, /^EW-[A-F0-9]{8}$/);
  assert.equal(orders[0].email, "candle@example.com");
  assert.equal(orders[0].items[0].unitPrice, 4200);
  assert.equal(orders[0].items[0].personalization, "For a friend");
  assert.equal(orders[0].subtotal, 8400);
  assert.match(body.order.message, /no payment was collected/);
});

test("checkout rejects invalid email, quantity, duplicate lines, unknown products, and oversized personalization", async () => {
  const { baseUrl } = await startTestServer();
  const cases = [
    { email: "not-an-email", items: [{ slug: "clay-and-cedar", quantity: 1 }] },
    { email: "valid@example.com", items: [{ slug: "clay-and-cedar", quantity: 0 }] },
    { email: "valid@example.com", items: [{ slug: "clay-and-cedar", quantity: 1 }, { slug: "clay-and-cedar", quantity: 2 }] },
    { email: "valid@example.com", items: [{ slug: "unknown-candle", quantity: 1 }] },
    { email: "valid@example.com", items: [{ slug: "clay-and-cedar", quantity: 1, personalization: "n".repeat(33) }] },
  ];

  for (const body of cases) {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.match((await response.json()).error, /please|one of those candles|between/i);
  }
});

test("checkout reports malformed JSON as a client error", async () => {
  const { baseUrl } = await startTestServer();
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"items":',
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid json/i);
});
