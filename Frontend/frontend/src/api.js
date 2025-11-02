// src/api.js
const API_URL = "http://127.0.0.1:5000"; // change when deployed

export async function getAllProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error("API Error");
    return await res.json();
  } catch (err) {
    console.error("Error getAllProducts:", err);
    return [];
  }
}

export async function getProductDetails(id) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    if (!res.ok) throw new Error("API Error");
    return await res.json();
  } catch (err) {
    console.error("Error getProductDetails:", err);
    return null;
  }
}

export async function addSalt(productId, saltObj) {
  try {
    const res = await fetch(`${API_URL}/api/products/${productId}/salts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saltObj),
    });
    return await res.json();
  } catch (err) {
    console.error("Error addSalt:", err);
    return { error: "Network error" };
  }
}
