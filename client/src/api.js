async function request(path, options) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export const getProducts = () => request("/products");

export const placeOrder = (order) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
