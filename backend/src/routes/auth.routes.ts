// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, refreshToken, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { registerSchema, loginSchema } from "../schemas/validation";

const router = Router();

// Public routes — no authentication needed
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);

// Protected route — requires valid JWT
router.get("/me", authenticate, getMe);

export default router;
