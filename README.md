# Ember & Wick

A responsive, original small-batch candle storefront built with React, Express, and MongoDB. The design and sample products are original; the linked retailer is a reference for the general product-collection format only.

## What’s here

- **Storefront:** responsive React/Vite collection page; search, scent filters, sort order, product-detail modal, personalization, accessible cart drawer, and demo checkout.
- **API:** Express catalog, health check, and validated order endpoints.
- **Persistence:** Mongoose candle and order models. MongoDB seeds the sample candle catalog on its first run; without a connection string, the API explicitly serves sample products and accepts in-memory demo orders.
- **Tests:** API behavior and storefront rendering/interaction tests.

## Run locally

Install Node.js 20.19+ and npm. From this directory:

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Express API runs on `http://localhost:4000`. MongoDB is optional for local exploration; set `MONGODB_URI` in `.env` to a MongoDB database to persist catalog data and orders. An invalid configured URI is an error rather than a silent switch to in-memory storage.

To build and test:

```bash
npm test
npm run build
npm start
```

The production server serves the built React app and API from the same origin. Set `PORT` and `MONGODB_URI` in the production environment.

## Deploy on Render

`render.yaml` configures one Node web service: Render runs `npm install && npm run build`, then `npm start`. Create a MongoDB Atlas database, set its `MONGODB_URI` as a secret in the Render dashboard, and deploy the Git repository. The service checks `/api/health`.

Deployment cannot be published from this workspace without a hosting account, Git remote, and MongoDB credentials. Never commit `.env` or paste credentials into chat.

## Project structure

```text
client/
  src/
    components/       # Header, product cards, detail dialog, cart drawer
    data/              # Frontend display helpers
    test/              # Vitest and Testing Library setup
    App.jsx
    api.js
    main.jsx
    styles.css
server/
  src/
    data/              # Original sample candle collection
    models/            # Mongoose schemas
    routes/            # Health, product, and order endpoints
    app.js
    database.js
    index.js
  test/
```
