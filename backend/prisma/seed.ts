// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Creates 2 demo users with todos so you can test immediately

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();

  // Create User 1
  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@test.com",
      password: await bcrypt.hash("password123", 10),
      todos: {
        create: [
          { title: "Learn Node.js and Express" },
          { title: "Set up PostgreSQL database", completed: true },
          { title: "Build a REST API with Prisma" },
          { title: "Write JWT authentication middleware" },
        ],
      },
    },
  });

  // Create User 2
  const bob = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@test.com",
      password: await bcrypt.hash("password123", 10),
      todos: {
        create: [
          { title: "Learn React hooks" },
          { title: "Build a todo app frontend", completed: true },
          { title: "Connect frontend to backend API" },
        ],
      },
    },
  });

  console.log("✅ Seeded successfully!");
  console.log(`👤 Alice: alice@test.com / password123`);
  console.log(`👤 Bob:   bob@test.com  / password123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
