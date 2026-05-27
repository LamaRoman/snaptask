// src/controllers/todos.controller.ts
// All todo CRUD operations. Every route here requires authentication.
// The key pattern: always filter by userId to enforce ownership.

import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import type { CreateTodoInput, UpdateTodoInput } from "../schemas/validation";

// GET /todos — return only the logged-in user's todos
export const getTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // The 'completed' query param lets the frontend filter: ?completed=true
    const { completed } = req.query;

    // Build the where clause dynamically
    const where: any = {
      userId: req.user!.userId, // CRITICAL: always scope to the current user
    };

    // Only add the completed filter if it was provided
    if (completed === "true") where.completed = true;
    if (completed === "false") where.completed = false;

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: "desc" }, // Newest first
    });

    res.status(200).json({ todos });
  } catch (error) {
    next(error);
  }
};

// GET /todos/:id — return a single todo
export const getTodoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: req.params.id },
    });

    // 404 if it doesn't exist
    if (!todo) {
      res.status(404).json({ message: "Todo not found." });
      return;
    }

    // 403 if it belongs to someone else
    // We use 403 (Forbidden) not 404 here because the resource exists,
    // but the user doesn't have permission. In a real app you might
    // return 404 to avoid leaking whether the ID exists.
    if (todo.userId !== req.user!.userId) {
      res.status(403).json({ message: "You don't have access to this todo." });
      return;
    }

    res.status(200).json({ todo });
  } catch (error) {
    next(error);
  }
};

// POST /todos — create a new todo
export const createTodo = async (
  req: Request<{}, {}, CreateTodoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.body;

    const todo = await prisma.todo.create({
      data: {
        title,
        userId: req.user!.userId, // Automatically associate with logged-in user
      },
    });

    res.status(201).json({
      message: "Todo created!",
      todo,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /todos/:id — update title and/or completed status
export const updateTodo = async (
  req: Request<{ id: string }, {}, UpdateTodoInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First find the todo to check it exists and belongs to this user
    const existing = await prisma.todo.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ message: "Todo not found." });
      return;
    }

    if (existing.userId !== req.user!.userId) {
      res.status(403).json({ message: "You can only edit your own todos." });
      return;
    }

    const { title, completed } = req.body;

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: {
        // Only update fields that were provided
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
      },
    });

    res.status(200).json({ message: "Todo updated!", todo: updated });
  } catch (error) {
    next(error);
  }
};

// PATCH /todos/:id/complete — toggle completed status
export const toggleComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await prisma.todo.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ message: "Todo not found." });
      return;
    }

    if (existing.userId !== req.user!.userId) {
      res.status(403).json({ message: "You can only edit your own todos." });
      return;
    }

    // Flip the current completed value
    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: { completed: !existing.completed },
    });

    res.status(200).json({ message: "Todo updated!", todo: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /todos/:id
export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const existing = await prisma.todo.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ message: "Todo not found." });
      return;
    }

    if (existing.userId !== req.user!.userId) {
      res.status(403).json({ message: "You can only delete your own todos." });
      return;
    }

    await prisma.todo.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: "Todo deleted successfully." });
  } catch (error) {
    next(error);
  }
};
