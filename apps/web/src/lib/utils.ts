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

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return "il y a " + Math.floor(interval) + " an(s)"
  interval = seconds / 2592000
  if (interval > 1) return "il y a " + Math.floor(interval) + " mois"
  interval = seconds / 86400
  if (interval > 1) return "il y a " + Math.floor(interval) + " jour(s)"
  interval = seconds / 3600
  if (interval > 1) return "il y a " + Math.floor(interval) + " h"
  interval = seconds / 60
  if (interval > 1) return "il y a " + Math.floor(interval) + " min"
  return "à l'instant"
}
