import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { Link } from "react-router-dom"
import { Loader2, Plus, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useConfirm } from "../lib/use-confirm"
import type {
  WorkflowType,
  PageGenerationFinalResult,
} from "@genai/shared/workflows"

type Page = {
  id: string
  title: string
  createdAt: string
}

type Workflow = {
  id: string
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  displayMessage: string | null
  result: PageGenerationFinalResult | null
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { confirm } = useConfirm()
  const [modalOpen, setModalOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<Workflow | null>(null)

  // Liste des pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await api.get("/pages")
      return res.data.pages as Page[]
    },
  })

  // Mutation pour lancer un workflow
  const startMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await api.post("/workflows/start", {
        type: "page-generation" satisfies WorkflowType,
        payload: { prompt },
      })
      return res.data as { workflowId: string }
    },
    onSuccess: (data) => {
      setActiveWorkflow(data.workflowId)
      setModalOpen(false)
      setPrompt("")
      pollWorkflow(data.workflowId)
    },
    onError: () => {
      toast.error("Erreur au lancement du workflow")
    },
  })

  // Polling du workflow
  const pollWorkflow = async (workflowId: string) => {
    const poll = async () => {
      try {
        const res = await api.get(`/workflows/${workflowId}`)
        const workflow = res.data.workflow as Workflow
        setWorkflowStatus(workflow)

        if (workflow.status === "COMPLETED") {
          setActiveWorkflow(null)
          setWorkflowStatus(null)
          queryClient.invalidateQueries({ queryKey: ["pages"] })
          toast.success("Page générée !", {
            action: workflow.result?.pageId
              ? {
                  label: "Voir",
                  onClick: () => {
                    window.location.href = `/dashboard/pages/${
                      workflow.result!.pageId
                    }`
                  },
                }
              : undefined,
          })
        } else if (workflow.status === "FAILED") {
          setActiveWorkflow(null)
          setWorkflowStatus(null)
          toast.error("Échec de la génération")
        } else {
          // Continue polling
          setTimeout(poll, 1000)
        }
      } catch {
        setActiveWorkflow(null)
        setWorkflowStatus(null)
        toast.error("Erreur de polling")
      }
    }
    poll()
  }

  // Suppression d'une page
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pages/${id}`)
    },
    onSuccess: () => {
      toast.success("Page supprimée")
      queryClient.invalidateQueries({ queryKey: ["pages"] })
    },
  })

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Supprimer cette page ?",
      message: "Cette action est irréversible.",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pages</h1>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!!activeWorkflow}
          className="flex items-center gap-2 border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Générer
        </button>
      </div>

      {/* Workflow en cours */}
      {activeWorkflow && workflowStatus && (
        <div className="flex items-center gap-3 border border-dashed p-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{workflowStatus.displayMessage || "En cours..."}</span>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="text-sm text-gray-500">Chargement...</div>
      ) : pages && pages.length > 0 ? (
        <div className="border divide-y">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <Link
                to={`/dashboard/pages/${page.id}`}
                className="flex-1 hover:underline"
              >
                {page.title || "Sans titre"}
              </Link>
              <button
                onClick={() => handleDelete(page.id)}
                className="p-1 text-gray-400 hover:text-black"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aucune page</div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-md bg-white border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Nouvelle page</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Décrivez la page à générer..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border px-3 py-2 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 text-sm border hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => startMutation.mutate(prompt)}
                disabled={!prompt.trim() || startMutation.isPending}
                className="px-3 py-1.5 text-sm border border-black bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {startMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Lancer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
