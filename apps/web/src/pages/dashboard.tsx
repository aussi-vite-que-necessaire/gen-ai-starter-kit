import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { authClient } from "../lib/auth-client"
import { FileText, Copy } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"
import { timeAgo } from "../lib/utils" // Ajoute l'utilitaire date
import { toast } from "sonner"

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
          <div className="divide-y divide-gray-100">
            {/* On affiche 3 faux éléments pendant le chargement */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 w-full">
                    {/* Faux titre */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    {/* Faux texte (2 lignes) */}
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  {/* Fausse date */}
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative p-6 transition-all hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Prompt Header */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="truncate">{item.prompt}</span>
                    </div>

                    {/* Result Preview */}
                    <p className="line-clamp-2 text-sm text-gray-500 font-mono bg-gray-50/50 p-1 rounded">
                      {item.result}
                    </p>
                  </div>

                  {/* Meta & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400 tabular-nums">
                      {timeAgo(item.createdAt)}
                    </span>

                    {/* Bouton qui apparaît au survol (group-hover) */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.result)
                        toast.success("Copié !")
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      title="Copier le résultat"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
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
