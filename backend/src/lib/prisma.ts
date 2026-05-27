// src/lib/prisma.ts
// We create a single PrismaClient instance and reuse it throughout the app.
// Without this pattern, each file that imports Prisma would create its own
// connection pool — that would be wasteful and cause issues in development.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

export default prisma;
