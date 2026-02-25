"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; SameSite=Lax`;
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      className="h-9 w-9 flex items-center justify-center rounded-xl text-spa-muted hover:text-spa-text hover:bg-spa-surface transition-colors text-lg"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀" : "🌙"}
    </button>
  );
}
