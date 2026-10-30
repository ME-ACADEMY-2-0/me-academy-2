"use client";
import { useSyncExternalStore } from "react";
import { useBrand } from "@/components/brand/BrandProvider";

const THEME_KEY = "scolar_theme";
const listeners = new Set<() => void>();

// The visitor's own choice ("light" | "dark"), or null when they haven't picked one.
const stored = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function writeTheme(light: boolean) {
  try {
    localStorage.setItem(THEME_KEY, light ? "light" : "dark");
  } catch {}
  listeners.forEach((fn) => fn());
}

// Visitors start on the school's default theme (Admin > Settings > Branding) until they toggle it themselves.
export function useTheme() {
  const fallbackLight = useBrand().themeDefault !== "dark";
  const light = useSyncExternalStore(
    subscribe,
    () => {
      const s = stored();
      return s ? s !== "dark" : fallbackLight;
    },
    () => fallbackLight,
  );
  return { light, dark: !light };
}
