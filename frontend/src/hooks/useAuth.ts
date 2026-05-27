// src/hooks/useAuth.ts
// A reusable hook that reads the current user from localStorage
// and provides a logout function. Used on any page that needs auth context.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuth = (requireAuth = true) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      // No token found — redirect to login if auth is required
      if (requireAuth) router.push("/login");
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      // Corrupted storage — clear and redirect
      localStorage.clear();
      if (requireAuth) router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [requireAuth, router]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return { user, loading, logout };
};
