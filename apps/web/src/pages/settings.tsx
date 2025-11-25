import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { toast } from "sonner"
import { User, Save, Loader2 } from "lucide-react"
import { PageHead } from "../components/shared/PageHead"

export default function SettingsPage() {
  const { data: session, refetch } = authClient.useSession()
  const [name, setName] = useState(session?.user.name || "")
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      // Magie : Better-Auth gère ça tout seul !
      await authClient.updateUser({
        name: name,
      })

      await refetch() // Met à jour la session locale (Sidebar, Header...)
      toast.success("Profil mis à jour avec succès")
    } catch (error) {
      toast.error(`Erreur lors de la mise à jour: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <PageHead title="Paramètres" />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Gérez vos informations personnelles.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header de la carte */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mon Profil</h3>
            <p className="text-xs text-gray-500">
              Visible sur vos factures et notifications.
            </p>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-6 space-y-6">
          {/* Champ Email (Read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <input
                type="email"
                value={session?.user.email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                Non modifiable
              </span>
            </div>
          </div>

          {/* Champ Nom */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleUpdateProfile}
              disabled={loading || name === session?.user.name}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
