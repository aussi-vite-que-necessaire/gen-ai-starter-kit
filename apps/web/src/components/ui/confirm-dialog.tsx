import { X } from "lucide-react"
import { useConfirmStore } from "../../lib/use-confirm"

export function ConfirmDialog() {
  const { isOpen, options, confirm, cancel } = useConfirmStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={cancel} />

      <div className="relative w-full max-w-sm bg-white border p-6 space-y-4">
        <button onClick={cancel} className="absolute top-4 right-4">
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-semibold">{options.title}</h3>
        <p className="text-sm text-gray-600">{options.message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={cancel}
            className="px-3 py-1.5 text-sm border hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={confirm}
            className="px-3 py-1.5 text-sm border border-black bg-black text-white hover:bg-gray-800"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
