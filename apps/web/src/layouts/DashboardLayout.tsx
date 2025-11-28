import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Sparkles, LogOut, Menu, X, Bot } from "lucide-react"
import { cn } from "../lib/utils"
import { authClient } from "../lib/auth-client"
import { Settings } from "lucide-react"

const navigation = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { name: "Générateur IA", href: "/dashboard/generator", icon: Sparkles },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => navigate("/login") },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Mobile Sidebar Overlay (Grisé arrière plan) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar (Toujours Fixed) */}
      <div
        className={cn(
          // Base layout: Fixed, Full Height, Width 64
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out flex flex-col",
          // Mobile: Hidden by default (translate), Desktop: Always visible (translate-0)
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-100 px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Bot className="h-6 w-6" />
            <span>Starter Kit</span>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
              {session?.user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-700">
                {session?.user.name || "Utilisateur"}
              </p>
              <p className="truncate text-xs text-gray-500">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* 3. Main Content Wrapper */}
      {/* lg:pl-64 crée l'espace pour la sidebar qui est fixed à gauche */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header (Menu Burger) */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Ouvrir sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Dashboard
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
