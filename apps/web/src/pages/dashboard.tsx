import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { authClient } from "../lib/auth-client"
import { FileText, Copy, MessageSquare, Clock, Loader2 } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"
import { timeAgo } from "../lib/utils"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query" // useQueryClient est important
import { Trash2 } from "lucide-react" // L'icône poubelle
import { useConfirm } from "../lib/use-confirm"
import { PageHead } from "../components/shared/PageHead"

type Generation = {
  id: string
  prompt: string
  result: string
  createdAt: string
}

export default function DashboardPage() {
  const queryClient = useQueryClient() // <--- Pour rafraîchir le cache
  const { confirm } = useConfirm()
  const { data: session, isPending: isSessionLoading } = authClient.useSession()

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => {
      const res = await api.get("/ai/history")
      return res.data.history as Generation[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai/history/${id}`)
    },
    onSuccess: () => {
      toast.success("Supprimé !")
      // C'est ICI la magie : on invalide le cache 'ai-history'
      // React Query va automatiquement relancer le fetch de la liste
      queryClient.invalidateQueries({ queryKey: ["ai-history"] })
    },
    onError: () => {
      toast.error("Impossible de supprimer")
    },
  })

  // On combine les états de chargement pour éviter les flashs partiels
  const isLoading = isHistoryLoading || isSessionLoading

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHead title="Vue d'ensemble" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span>Bienvenue,</span>
            {session?.user.name ? (
              <span className="font-medium text-gray-900">
                {session.user.name}
              </span>
            ) : (
              <Skeleton className="h-5 w-32" />
            )}
          </div>
        </div>
      </div>

      {/* Stats Rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Générations</p>
              <div className="mt-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h4 className="text-2xl font-bold text-gray-900">
                    {history?.length || 0}
                  </h4>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Tu pourras ajouter d'autres stats ici */}
      </div>

      {/* Historique Récent */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Historique récent</h3>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {/* SKELETONS PARFAITEMENT ALIGNÉS AVEC LE CONTENU RÉEL */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 w-full">
                    {/* Header: Rond + Titre */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    {/* Body: Gros bloc texte */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  {/* Date à droite */}
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Prompt Header */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="truncate">{item.prompt}</span>
                    </div>

                    {/* Result Preview */}
                    <p className="line-clamp-2 text-sm text-gray-500 font-mono bg-gray-100/50 p-1.5 rounded-md mt-2 border border-transparent group-hover:border-gray-200 transition-colors">
                      {item.result}
                    </p>
                  </div>

                  {/* Meta & Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400 tabular-nums">
                      <Clock className="h-3 w-3" />
                      {timeAgo(item.createdAt)}
                    </div>

                    {/* Bouton Copy */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.result)
                        toast.success("Copié !")
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95"
                      title="Copier le résultat"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      onClick={async () => {
                        // C'est ici que ça change !
                        const ok = await confirm({
                          title: "Supprimer cette génération ?",
                          message:
                            "Cette action est irréversible. Le texte sera définitivement effacé de l'historique.",
                          variant: "danger",
                        })

                        if (ok) {
                          deleteMutation.mutate(item.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all active:scale-95"
                      title="Supprimer"
                    >
                      {/* Petit spinner si c'est cet item précis qu'on supprime (bonus UX) */}
                      {deleteMutation.isPending &&
                      deleteMutation.variables === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-3">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Aucun historique
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
              Lancez votre première génération pour voir apparaître vos
              résultats ici.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
