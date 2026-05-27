// src/app/page.tsx
// The root "/" route — just redirect to /todos (the app's main page).
// If the user isn't logged in, /todos will redirect them to /login.

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/todos");
}
