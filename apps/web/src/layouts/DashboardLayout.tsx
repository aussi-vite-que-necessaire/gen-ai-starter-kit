import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"
import { cn } from "../lib/utils"
import { authClient } from "../lib/auth-client"

const navigation = [
  { name: "Pages", href: "/dashboard", icon: LayoutDashboard },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => navigate("/login") },
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-56 border-r flex flex-col">
        {/* Logo */}
        <div className="h-14 border-b flex items-center px-4 font-semibold">
          Starter Kit
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded",
                  isActive ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t p-3 space-y-2">
          <div className="text-sm truncate">{session?.user.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
