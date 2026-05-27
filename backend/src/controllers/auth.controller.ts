// src/controllers/auth.controller.ts
// Handles user registration and login.
// Controllers contain the actual business logic — routes just point to them.

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import type { RegisterInput, LoginInput } from "../schemas/validation";

// Helper to generate tokens — keeps the controller clean
const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" } // Short-lived: 15 minutes
  );

  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" } // Long-lived: 7 days
  );

  return { accessToken, refreshToken };
};

// POST /auth/register
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    // 2. Hash the password — NEVER store plain text
    // 10 = salt rounds (higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user in the database
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // 4. Return success — do NOT include the password
    res.status(201).json({
      message: "Account created successfully!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// POST /auth/login
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Use the same error for "wrong email" and "wrong password"
    //    This prevents attackers from figuring out which emails exist
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // 3. Compare the submitted password against the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // 5. Return tokens and user info (no password)
    res.status(200).json({
      message: "Logged in successfully!",
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/refresh
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({ message: "Refresh token is required." });
      return;
    }

    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      email: string;
    };

    // Issue new tokens
    const tokens = generateTokens(decoded.userId, decoded.email);

    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

// GET /auth/me — returns the currently logged-in user's profile
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
