// src/middleware/errorHandler.ts
// Express's global error handler — catches any error passed via next(error).
// Must have exactly 4 parameters for Express to recognize it as an error handler.

import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Never expose the full stack trace to the client in production
  const isDev = process.env.NODE_ENV === "development";

  res.status(500).json({
    message: "Something went wrong on our end.",
    ...(isDev && { error: err.message, stack: err.stack }),
  });
};
