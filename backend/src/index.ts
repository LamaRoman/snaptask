// src/index.ts
// The main entry point for the Express server.

import "dotenv/config"; // Load .env variables first — must be before any other imports
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import todoRoutes from "./routes/todos.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---

// CORS: Allow requests from our Next.js frontend
// In production, replace the origin with your actual frontend URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies/auth headers
  })
);

// Parse JSON request bodies — without this, req.body is undefined
app.use(express.json());

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

// Health check — useful for deployment platforms to verify the server is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler — catches any unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler — MUST be last, after all routes
app.use(errorHandler);

// --- Start ---
app.listen(PORT, () => {
  console.log(`\n🚀 SnapTask API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Auth:         http://localhost:${PORT}/auth`);
  console.log(`✅ Todos:        http://localhost:${PORT}/todos\n`);
});
