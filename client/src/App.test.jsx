import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getProducts, placeOrder } from "./api";

vi.mock("./api", () => ({
  getProducts: vi.fn(),
  placeOrder: vi.fn(),
}));

const products = [
  { slug: "clay-and-cedar", name: "Clay & Cedar", family: "Woodsy · warm", description: "A warm cedar candle for a quiet evening.", notes: ["Cedarwood", "Amber", "Dry leaves"], size: "8 oz · 227 g", price: 4200, burnTime: 40, stockStatus: "in_stock", badge: "A LITTLE FAVOURITE", tone: "clay", featuredOrder: 1 },
  { slug: "still-garden", name: "Still Garden", family: "Floral · gentle", description: "Jasmine and soft petals.", notes: ["Jasmine", "Green stems", "Soft petals"], size: "8 oz · 227 g", price: 4400, burnTime: 40, stockStatus: "in_stock", badge: "", tone: "garden", featuredOrder: 2 },
  { slug: "after-hours", name: "After Hours", family: "Woody · smoky", description: "Sandalwood and vetiver.", notes: ["Sandalwood", "Vetiver", "Smoked vanilla"], size: "8 oz · 227 g", price: 4600, burnTime: 45, stockStatus: "in_stock", badge: "", tone: "dusk", featuredOrder: 3 },
  { slug: "sunday-linen", name: "Sunday Linen", family: "Fresh · soft", description: "Soft cotton and bergamot.", notes: ["Bergamot", "Cotton flower", "Soft musk"], size: "8 oz · 227 g", price: 4200, burnTime: 40, stockStatus: "in_stock", badge: "", tone: "linen", featuredOrder: 4 },
];

beforeEach(() => {
  window.localStorage.clear();
  getProducts.mockResolvedValue({ products });
  placeOrder.mockResolvedValue({ order: { reference: "EW-12345678", message: "This was a demo order." } });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("candle collection", () => {
  it("loads the products and filters cards by fragrance family", async () => {
    const user = userEvent.setup();
    render(<App />);
    const collection = screen.getByRole("region", { name: "The candle collection" });

    expect(await screen.findByText("Clay & Cedar")).toBeInTheDocument();
    expect(screen.getByText("Sunday Linen")).toBeInTheDocument();

    await user.click(within(collection).getByRole("button", { name: "Floral" }));

    expect(screen.getByText("Still Garden")).toBeInTheDocument();
    expect(screen.queryByText("Clay & Cedar")).not.toBeInTheDocument();
  });

  it("adds a personalized candle, edits quantity, places a demo order, and empties the bag", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Discover Clay & Cedar" }));

    const dialog = screen.getByRole("dialog", { name: "Clay & Cedar" });
    await user.type(within(dialog).getByLabelText(/Add a personal note/), "For your new home");
    await user.click(within(dialog).getByRole("button", { name: /Add to bag/ }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(within(screen.getByRole("banner")).getByRole("button", { name: /Open bag/ }));

    const cart = screen.getByRole("dialog", { name: /Your bag/ });
    expect(within(cart).getByText(/For your new home/)).toBeInTheDocument();
    await user.click(within(cart).getByRole("button", { name: "Increase Clay & Cedar quantity" }));
    await user.type(within(cart).getByRole("textbox", { name: "YOUR EMAIL ADDRESS" }), "person@example.com");
    await user.click(within(cart).getByRole("button", { name: /Place sample order/ }));

    await waitFor(() => expect(screen.getByText("Your sample order is in.")).toBeInTheDocument());
    expect(placeOrder).toHaveBeenCalledWith({
      email: "person@example.com",
      items: [{ slug: "clay-and-cedar", quantity: 2, personalization: "For your new home" }],
    });
    expect(window.localStorage.getItem("ember-and-wick-bag")).toBe("[]");
  });

  it("shows product-load errors and an empty state when filtering has no matches", async () => {
    getProducts.mockResolvedValue({ products });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Clay & Cedar");
    const collection = screen.getByRole("region", { name: "The candle collection" });

    await user.click(within(collection).getByRole("button", { name: "Fresh" }));
    await user.click(within(collection).getByRole("button", { name: "Search fragrances" }));
    fireEvent.change(screen.getByLabelText("Search candle fragrances"), { target: { value: "nonexistent" } });

    expect(screen.getByText("No candles found for that little search.")).toBeInTheDocument();
  });
});
