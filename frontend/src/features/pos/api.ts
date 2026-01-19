import type { Category, Product } from "./types";

const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-storage");
  let authToken = null;

  if (token) {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed.state?.token;
    } catch (e) {
      console.error("Failed to parse auth token", e);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, data.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  async getCategories(): Promise<{ categories: Category[] }> {
    return fetchWithAuth(`${API_BASE}/categories`);
  },

  async createCategory(name: string, slug: string): Promise<Category> {
    return fetchWithAuth(`${API_BASE}/categories/create`, {
      method: "POST",
      body: JSON.stringify({ name, slug }),
    });
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return fetchWithAuth(`${API_BASE}/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    return fetchWithAuth(`${API_BASE}/categories/${id}/delete`, {
      method: "DELETE",
    });
  },

  async getProducts(categoryId?: number): Promise<{ products: Product[] }> {
    const url = categoryId
      ? `${API_BASE}/products?category_id=${categoryId}`
      : `${API_BASE}/products`;
    return fetchWithAuth(url);
  },

  async createProduct(data: {
    name: string;
    price: number;
    category_id: number;
  }): Promise<Product> {
    return fetchWithAuth(`${API_BASE}/products/create`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: number | string, data: Partial<Product>): Promise<Product> {
    return fetchWithAuth(`${API_BASE}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: number | string): Promise<{ success: boolean }> {
    return fetchWithAuth(`${API_BASE}/products/${id}/delete`, {
      method: "DELETE",
    });
  },
};
