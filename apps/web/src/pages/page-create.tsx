import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import type { WorkflowType } from "@genai/shared/workflows"

export default function PageCreatePage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState("")

  const mutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await api.post("/workflows/start", {
        type: "page-generation" satisfies WorkflowType,
        payload: { prompt },
      })
      return res.data as { workflowId: string }
    },
    onSuccess: (data) => {
      navigate(`/dashboard/workflows/${data.workflowId}`)
    },
    onError: () => {
      toast.error("Erreur au lancement")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      mutation.mutate(prompt)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Nouvelle page</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm mb-1">
            Décrivez la page à générer
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Une page de présentation pour une startup tech..."
            className="w-full border px-3 py-2 text-sm min-h-[100px]"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm border hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!prompt.trim() || mutation.isPending}
            className="px-4 py-2 text-sm border border-black bg-black text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Générer
          </button>
        </div>
      </form>
    </div>
  )
}

