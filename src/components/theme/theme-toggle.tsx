"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

function subscribe(onStoreChange: () => void) {
  window.addEventListener("elf-theme", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("elf-theme", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");

  function toggle() {
    const next = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("elf-theme", next);
    } catch {
      /* ignore quota */
    }
    window.dispatchEvent(new Event("elf-theme"));
  }

  return (
    <button
      type="button"
      className={`grid size-9 shrink-0 place-items-center sm:size-10 ${className ?? "text-espresso"}`}
      aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      {mounted && theme === "dark" ? <Sun className="size-[18px]" strokeWidth={1.75} /> : <Moon className="size-[18px]" strokeWidth={1.75} />}
    </button>
  );
}
