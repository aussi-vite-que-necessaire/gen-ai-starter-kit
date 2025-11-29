import { useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { PageGenerationFinalResult } from "@genai/shared/workflows"

type Workflow = {
  id: string
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  displayMessage: string | null
  error: string | null
  result: PageGenerationFinalResult | null
}

export default function WorkflowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: workflow } = useQuery({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const res = await api.get(`/workflows/${id}`)
      return res.data.workflow as Workflow
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Stop polling when completed or failed
      if (status === "COMPLETED" || status === "FAILED") {
        return false
      }
      return 1000
    },
  })

  // Redirect when completed
  useEffect(() => {
    if (workflow?.status === "COMPLETED" && workflow.result?.pageId) {
      toast.success("Page générée !")
      navigate(`/dashboard/pages/${workflow.result.pageId}`)
    }
  }, [workflow, navigate])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Génération en cours</h1>
      </div>

      <div className="max-w-lg space-y-4">
        {/* Status */}
        <div className="border p-4 space-y-3">
          {workflow?.status === "COMPLETED" ? (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Terminé !</span>
            </div>
          ) : workflow?.status === "FAILED" ? (
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Échec</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{workflow?.displayMessage || "En cours..."}</span>
            </div>
          )}

          {workflow?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 border border-red-200">
              {workflow.error}
            </div>
          )}
        </div>

        {/* Actions */}
        {workflow?.status === "FAILED" && (
          <div className="flex gap-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm border hover:bg-gray-50"
            >
              Retour
            </Link>
            <Link
              to="/dashboard/pages/create"
              className="px-4 py-2 text-sm border border-black bg-black text-white hover:bg-gray-800"
            >
              Réessayer
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

