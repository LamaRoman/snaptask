// src/schemas/validation.ts
// All Zod schemas live here. Centralizing them makes it easy to reuse
// and update validation rules without hunting across controller files.

import { z } from "zod";

// --- Auth Schemas ---

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- Todo Schemas ---

export const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
});

export const updateTodoSchema = z.object({
  // Optional: title can be updated or omitted
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title is too long")
    .optional(),
  completed: z.boolean().optional(),
});

// TypeScript types inferred from schemas — no need to define them separately
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
