import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { ArrowLeft } from "lucide-react"

type Page = {
  id: string
  title: string
  content: unknown
  createdAt: string
}

export default function PageDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const res = await api.get(`/pages/${id}`)
      return res.data.page as Page
    },
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement...</div>
  }

  if (error || !page) {
    return <div className="text-sm text-gray-500">Page introuvable</div>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{page.title || "Sans titre"}</h1>
        <pre className="border p-4 text-sm overflow-auto bg-gray-50">
          {JSON.stringify(page.content, null, 2)}
        </pre>
      </div>
    </div>
  )
}
