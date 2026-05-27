// src/lib/api.ts
// Centralizes all API calls. This way if the base URL changes,
// we only update it in one place, not across every component.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Get the stored access token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null; // Server-side guard
  return localStorage.getItem("accessToken");
};

// Generic fetch wrapper with auth header
const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // If we get a 401, the token is expired/invalid — clear storage
  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return res;
};

// --- Auth API ---
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch("/auth/me"),
};

// --- Todos API ---
export const todosApi = {
  getAll: (filter?: "all" | "active" | "completed") => {
    const params = new URLSearchParams();
    if (filter === "active") params.set("completed", "false");
    if (filter === "completed") params.set("completed", "true");
    return apiFetch(`/todos?${params.toString()}`);
  },

  create: (title: string) =>
    apiFetch("/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  update: (id: string, data: { title?: string; completed?: boolean }) =>
    apiFetch(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  toggleComplete: (id: string) =>
    apiFetch(`/todos/${id}/complete`, { method: "PATCH" }),

  delete: (id: string) =>
    apiFetch(`/todos/${id}`, { method: "DELETE" }),
};
