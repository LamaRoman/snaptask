# SnapTask 📝

> **Project 1 of the PERN stack teaching curriculum.**
> A simple full-stack todo app with JWT authentication — built to teach the complete request lifecycle from browser to database.

---

## What students learn from this project

| Concept | Where it's taught |
|---|---|
| Node.js + Express server | `backend/src/index.ts` |
| REST API design (CRUD) | `backend/src/routes/todos.routes.ts` |
| Controller pattern | `backend/src/controllers/` |
| Prisma ORM + PostgreSQL | `backend/prisma/schema.prisma` |
| Password hashing (bcrypt) | `backend/src/controllers/auth.controller.ts` |
| JWT auth (sign + verify) | `backend/src/controllers/auth.controller.ts` |
| Auth middleware | `backend/src/middleware/authenticate.ts` |
| Zod validation | `backend/src/schemas/validation.ts` |
| Global error handling | `backend/src/middleware/errorHandler.ts` |
| Next.js App Router | `frontend/src/app/` |
| Protected routes | `frontend/src/hooks/useAuth.ts` |
| API calls with fetch | `frontend/src/lib/api.ts` |
| Optimistic UI updates | `frontend/src/app/todos/page.tsx` |
| Tailwind CSS | All frontend components |

---

## Project structure

```
snaptask/
├── backend/                   # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (User + Todo)
│   │   └── seed.ts            # Demo data seeder
│   ├── src/
│   │   ├── index.ts           # Entry point — Express app setup
│   │   ├── lib/
│   │   │   └── prisma.ts      # Prisma singleton client
│   │   ├── middleware/
│   │   │   ├── authenticate.ts  # JWT verification middleware
│   │   │   ├── validate.ts      # Zod validation middleware
│   │   │   └── errorHandler.ts  # Global error handler
│   │   ├── schemas/
│   │   │   └── validation.ts    # All Zod schemas
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # register, login, me
│   │   │   └── todos.controller.ts  # CRUD + ownership checks
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       └── todos.routes.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                  # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # Root layout
    │   │   ├── page.tsx           # Redirects to /todos
    │   │   ├── globals.css        # Tailwind imports
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   └── todos/
    │   │       └── page.tsx       # Main app page
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── AddTodoForm.tsx
    │   │   └── TodoItem.tsx
    │   ├── hooks/
    │   │   └── useAuth.ts         # Auth guard hook
    │   └── lib/
    │       └── api.ts             # All API calls
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## API Reference

### Auth routes — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Create new account |
| POST | `/auth/login` | ❌ | Login, returns JWT tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| GET | `/auth/me` | ✅ | Get current user's profile |

### Todo routes — `/todos`

> All routes require `Authorization: Bearer <token>` header

| Method | Path | Description |
|--------|------|-------------|
| GET | `/todos` | Get all your todos (filter: `?completed=true/false`) |
| GET | `/todos/:id` | Get a single todo |
| POST | `/todos` | Create a todo |
| PUT | `/todos/:id` | Update title and/or completed |
| PATCH | `/todos/:id/complete` | Toggle completed status |
| DELETE | `/todos/:id` | Delete a todo |

---

## Setup guide

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or a free [Neon](https://neon.tech) cloud database
- Git

---

### 1. Clone and install

```bash
# Clone the repo
git clone <your-repo-url>
cd snaptask

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# If using local PostgreSQL:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/snaptask"

# If using Neon (cloud):
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/snaptask?sslmode=require"

# Generate strong secrets (run in terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-string"

PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

### 3. Set up the database

```bash
cd backend

# Create the database tables from schema.prisma
npx prisma migrate dev --name init

# (Optional) Seed with demo users and todos
npx ts-node prisma/seed.ts

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

After seeding, two demo accounts are available:
- `alice@test.com` / `password123`
- `bob@test.com` / `password123`

---

### 4. Configure frontend environment

```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### 5. Run both servers

Open **two terminal tabs**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## Testing the API in Postman

Import this collection flow to test all routes manually:

### Step 1 — Register
```
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@test.com",
  "password": "password123"
}
```

### Step 2 — Login (save the accessToken)
```
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "password123"
}
```
Copy the `accessToken` from the response.

### Step 3 — Create a todo
```
POST http://localhost:4000/todos
Authorization: Bearer <your-token-here>
Content-Type: application/json

{
  "title": "Learn PERN stack"
}
```

### Step 4 — Get all todos
```
GET http://localhost:4000/todos
Authorization: Bearer <your-token-here>
```

### Step 5 — Toggle complete
```
PATCH http://localhost:4000/todos/<todo-id>/complete
Authorization: Bearer <your-token-here>
```

### Step 6 — Try with NO token (should get 401)
```
GET http://localhost:4000/todos
```
Expected: `{ "message": "No token provided. Please log in." }`

---

## Key teaching points for instructors

### 🔑 The ownership pattern (most important concept)
Every todo route checks `todo.userId === req.user.userId` before
allowing any mutation. This is the fundamental security pattern students
must understand before moving to Project 2.

Show students this with two accounts: log in as Alice, try to delete
one of Bob's todo IDs directly in Postman. They get a 403.

### 🔒 JWT flow
1. Login → server signs a token with `JWT_SECRET`
2. Client stores token in localStorage
3. Every subsequent request sends `Authorization: Bearer <token>`
4. `authenticate` middleware verifies the token on every protected route

Paste a token at [jwt.io](https://jwt.io) during class — students can
see the decoded payload (userId, email, exp). Show what happens when
you change one character.

### ⚡ Optimistic UI
In `todos/page.tsx`, `handleToggle` and `handleDelete` update the
state **before** the API call resolves, then roll back if the call
fails. This makes the UI feel instant. Ask students: "What would the
UI feel like without this?"

### 🏗️ Controller pattern
Routes (`auth.routes.ts`) only define the path and middleware chain.
Controllers (`auth.controller.ts`) contain all the actual logic.
This separation makes the code easier to test and maintain.

---

## Common errors and fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Can't reach database server` | PostgreSQL not running or wrong DATABASE_URL | Check your .env DATABASE_URL format |
| `CORS error in browser` | FRONTEND_URL in backend .env doesn't match | Set `FRONTEND_URL=http://localhost:3000` in backend .env |
| `PrismaClientInitializationError` | Prisma client not generated | Run `npx prisma generate` |
| `JWT malformed` | Token is corrupted or missing "Bearer " prefix | Check localStorage has the full token; check Authorization header format |
| `Network error - backend running?` | Frontend can't reach backend | Make sure backend is running on port 4000 |

---

## What's next — Project 2 (Writr)

After completing SnapTask, students are ready for Writr which adds:
- Prisma **relations** (Post → Category, Post → User)
- **File uploads** with multer + Cloudinary
- **Pagination** (offset-based, then cursor-based)
- **Next.js server components** vs client components
- **react-hook-form** + Zod on the frontend
- **Search** with URL params

---

## Tech stack

- **Backend:** Node.js · Express · TypeScript · Prisma · PostgreSQL · bcryptjs · jsonwebtoken · Zod
- **Frontend:** Next.js 14 (App Router) · React · TypeScript · Tailwind CSS
# snaptask
