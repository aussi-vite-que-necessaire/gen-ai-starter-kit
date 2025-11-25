// apps/web/src/pages/dashboard.tsx
import { authClient } from "../lib/auth-client"

export default function DashboardPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 col-span-full">
          <h3 className="text-lg font-semibold text-gray-900">
            Bonjour, {session?.user.name} 👋
          </h3>
          <p className="mt-1 text-gray-500">
            Bienvenue sur votre tableau de bord. Tout est opérationnel.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900">Activité IA</h3>
          <p className="mt-2 text-sm text-gray-500">
            0 générations aujourd'hui
          </p>
        </div>
      </div>
    </div>
  )
}
