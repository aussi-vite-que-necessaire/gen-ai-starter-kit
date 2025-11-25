// apps/web/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne les classes CSS conditionnelles (clsx)
 * et résout les conflits Tailwind (tailwind-merge).
 * Ex: cn("p-4", condition && "bg-red-500", "p-2") -> "bg-red-500 p-2" (le p-4 est écrasé)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
