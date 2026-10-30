"use client";
import { createContext, useContext } from "react";
import { BRAND_DEFAULTS, type Brand } from "@/lib/brand-shared";

// year is read once on the server (cached) for "© year" lines; client components can't read the clock while prerendering.
const BrandContext = createContext<Brand & { year?: number }>(BRAND_DEFAULTS);

export function BrandProvider({ brand, year, children }: { brand: Brand; year: number; children: React.ReactNode }) {
  return <BrandContext.Provider value={{ ...brand, year }}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);
