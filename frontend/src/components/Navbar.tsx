"use client";
// src/components/Navbar.tsx

interface NavbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">SnapTask</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">Welcome, {userName}</span>
        </div>

        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
