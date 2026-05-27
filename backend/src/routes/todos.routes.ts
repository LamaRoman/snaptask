// src/routes/todos.routes.ts
// All todo routes require authentication — authenticate middleware applied to every route.

import { Router } from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
} from "../controllers/todos.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createTodoSchema, updateTodoSchema } from "../schemas/validation";

const router = Router();

// Apply authenticate to ALL routes in this file
router.use(authenticate);

router.get("/", getTodos);                                        // GET    /todos
router.get("/:id", getTodoById);                                  // GET    /todos/:id
router.post("/", validate(createTodoSchema), createTodo);         // POST   /todos
router.put("/:id", validate(updateTodoSchema), updateTodo);       // PUT    /todos/:id
router.patch("/:id/complete", toggleComplete);                    // PATCH  /todos/:id/complete
router.delete("/:id", deleteTodo);                                // DELETE /todos/:id

export default router;
