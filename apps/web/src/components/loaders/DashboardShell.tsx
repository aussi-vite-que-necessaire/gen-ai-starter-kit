import { Bot } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Fake Sidebar (Mêmes dimensions que la vraie) */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
        {/* Logo Header */}
        <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-100 px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Bot className="h-6 w-6" />
            <span>Starter Kit</span>
          </div>
        </div>

        {/* Fake Nav Items */}
        <div className="flex-1 px-4 py-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Fake User Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fake Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Placeholder */}
        <div className="h-16 border-b border-gray-200 bg-white lg:hidden" />

        {/* Page Content Skeletons */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Stats Grid Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>

          {/* List Skeletons */}
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  )
}
