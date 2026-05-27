// src/middleware/authenticate.ts
// Protects routes by verifying the JWT in the Authorization header.
// On success, attaches the decoded user payload to req.user.

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express's Request type to include our user payload
// This gives us TypeScript autocomplete on req.user throughout the app
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Get the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Check it exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided. Please log in." });
    return;
  }

  // 3. Extract just the token part (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verify the token using our secret key
    // jwt.verify throws an error if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    // 5. Attach the decoded user to the request object
    req.user = decoded;
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};
