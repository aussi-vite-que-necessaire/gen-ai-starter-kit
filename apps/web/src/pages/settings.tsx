import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { data: session, refetch } = authClient.useSession()
  const [name, setName] = useState(session?.user.name || "")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await authClient.updateUser({ name })
      await refetch()
      toast.success("Profil mis à jour")
    } catch {
      toast.error("Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Paramètres</h1>

      <div className="border p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={session?.user.email || ""}
            disabled
            className="w-full border px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading || name === session?.user.name}
          className="border border-black bg-black text-white px-3 py-1.5 text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}
