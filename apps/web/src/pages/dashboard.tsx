import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { Link } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useConfirm } from "../lib/use-confirm"

type Page = {
  id: string
  title: string
  createdAt: string
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { confirm } = useConfirm()

  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await api.get("/pages")
      return res.data.pages as Page[]
    },
  })

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pages</h1>
        <Link
          to="/dashboard/pages/create"
          className="flex items-center gap-2 border border-black px-3 py-1.5 text-sm hover:bg-black hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Générer
        </Link>
      </div>

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
    </div>
  )
}
