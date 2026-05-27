"use client";
// src/app/todos/page.tsx
// The main app page. Requires authentication — useAuth redirects if no token.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { todosApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AddTodoForm from "@/components/AddTodoForm";
import TodoItem from "@/components/TodoItem";

// The shape of a todo from the API
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

type FilterType = "all" | "active" | "completed";

export default function TodosPage() {
  // Protect this page — redirects to /login if no token
  const { user, loading: authLoading, logout } = useAuth(true);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch todos from the API — re-runs whenever filter changes
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await todosApi.getAll(filter);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTodos(data.todos);
    } catch (err: any) {
      setError(err.message || "Failed to load todos.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTodos();
    }
  }, [authLoading, user, fetchTodos]);

  // --- CRUD Handlers ---

  const handleAdd = async (title: string) => {
    const res = await todosApi.create(title);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // Add to state immediately (optimistic-ish — we know it succeeded)
    setTodos((prev) => [data.todo, ...prev]);
  };

  const handleToggle = async (id: string) => {
    // Optimistic update: flip completed locally before API responds
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const res = await todosApi.toggleComplete(id);
      if (!res.ok) {
        // Revert on failure
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
      }
    } catch {
      // Revert on network error
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleUpdate = async (id: string, title: string) => {
    const res = await todosApi.update(id, { title });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  };

  const handleDelete = async (id: string) => {
    // Optimistic delete: remove from UI immediately
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await todosApi.delete(id);
      if (!res.ok) {
        // Revert if API failed — refetch to restore accurate state
        await fetchTodos();
      }
    } catch {
      await fetchTodos();
    }
  };

  // Derived stats from local state
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  // Filter todos for display
  const visibleTodos =
    filter === "all"
      ? todos
      : filter === "active"
      ? todos.filter((t) => !t.completed)
      : todos.filter((t) => t.completed);

  // Show nothing while checking auth
  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user?.name || ""} onLogout={logout} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.active} remaining · {stats.completed} completed · {stats.total} total
          </p>
        </div>

        {/* Add todo form */}
        <div className="mb-6">
          <AddTodoForm onAdd={handleAdd} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          {(["all", "active", "completed"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
              {f === "active" && stats.active > 0 && (
                <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {stats.active}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Todo list */}
        {loading ? (
          // Skeleton loading state
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchTodos}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : visibleTodos.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {filter === "completed" ? "🎉" : filter === "active" ? "✨" : "📝"}
            </div>
            <p className="text-gray-500 text-sm">
              {filter === "completed"
                ? "No completed tasks yet."
                : filter === "active"
                ? "All tasks are completed!"
                : "No tasks yet. Add one above!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Clear completed button */}
        {stats.completed > 0 && filter !== "active" && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                const completed = todos.filter((t) => t.completed);
                for (const t of completed) {
                  await todosApi.delete(t.id);
                }
                setTodos((prev) => prev.filter((t) => !t.completed));
              }}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear {stats.completed} completed task{stats.completed > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
