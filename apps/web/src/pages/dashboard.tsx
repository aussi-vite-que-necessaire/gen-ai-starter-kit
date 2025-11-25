import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { authClient } from "../lib/auth-client"
import { Clock, MessageSquare, FileText, Loader2 } from "lucide-react"

// Type basique des données attendues
type Generation = {
  id: string
  prompt: string
  result: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession()

  // 1. Récupération des données avec React Query
  const { data: history, isLoading } = useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => {
      const res = await api.get("/ai/history")
      return res.data.history as Generation[]
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
          <p className="text-gray-500">Bienvenue, {session?.user.name}</p>
        </div>
      </div>

      {/* Stats Rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Générations</p>
              <h4 className="text-2xl font-bold text-gray-900">
                {isLoading ? "-" : history?.length || 0}
              </h4>
            </div>
          </div>
        </div>
        {/* Tu pourras ajouter d'autres stats ici (Crédits restants, etc.) */}
      </div>

      {/* Historique Récent */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Historique récent</h3>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {/* Prompt (Texte source) */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="line-clamp-1">{item.prompt}</span>
                    </div>
                    {/* Résultat (Extrait) */}
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {item.result}
                    </p>
                  </div>
                  {/* Date */}
                  <div className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-50 p-3">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Aucune génération pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
