// src/middleware/validate.ts
// A reusable middleware factory that validates req.body against any Zod schema.
// Usage: router.post('/route', validate(mySchema), controller)

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into a clean { field: message } object
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join(".");
        errors[field] = err.message;
      });

      res.status(400).json({
        message: "Validation failed",
        errors,
      });
      return;
    }

    // Attach the validated (and typed) data back to req.body
    req.body = result.data;
    next();
  };
