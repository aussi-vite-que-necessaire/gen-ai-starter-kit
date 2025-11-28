import { AlertTriangle, X } from "lucide-react"
import { useConfirmStore } from "../../lib/use-confirm"
import { cn } from "../../lib/utils"

export function ConfirmDialog() {
  // On récupère l'état directement depuis le store
  const { isOpen, options, confirm, cancel } = useConfirmStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop (Fond grisé flouté) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={cancel}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icone dynamique */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                options.variant === "danger"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {options.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {options.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
          <button
            onClick={cancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={confirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              options.variant === "danger"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-black hover:bg-gray-800 focus:ring-gray-900"
            )}
          >
            Confirmer
          </button>
        </div>

        {/* Close Button absolute */}
        <button
          onClick={cancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
