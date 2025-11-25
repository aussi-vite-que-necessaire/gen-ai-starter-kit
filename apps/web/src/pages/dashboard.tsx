// apps/web/src/pages/dashboard.tsx
import { authClient } from "../lib/auth-client"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate("/login"), // Logout renvoie au login
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session?.user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card Exemple */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900">Mon Compte</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gérez vos préférences et votre abonnement.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900">Activité IA</h3>
            <p className="mt-2 text-sm text-gray-500">
              Visualisez vos dernières générations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
