import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { api } from "../lib/api"
import { Sparkles, Copy, Check } from "lucide-react"
import { cn } from "../lib/utils"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import { PageHead } from "../components/shared/PageHead"

export default function GeneratorPage() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState(false)

  // Hook React Query pour gérer l'appel API
  const mutation = useMutation({
    mutationFn: async (text: string) => {
      // Appel à notre Backend Clean Arch
      const res = await api.post("/ai/summary", { text })
      return res.data // { success: true, summary: "..." }
    },
  })

  const handleCopy = () => {
    if (mutation.data?.summary) {
      navigator.clipboard.writeText(mutation.data.summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Résumé copié dans le presse-papier !")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHead title="Générateur IA" />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Résumeur IA</h1>
        <p className="text-gray-500">
          Copiez un texte long, notre IA va en extraire l'essentiel.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Colonne Gauche : Input */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Votre texte source
            </label>
            <textarea
              className="min-h-[300px] w-full resize-none rounded-lg border-gray-200 p-4 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              placeholder="Collez votre texte ici (min 10 caractères)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => mutation.mutate(input)}
                disabled={mutation.isPending || input.length < 10}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-all",
                  mutation.isPending || input.length < 10
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                )}
              >
                {mutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Résumer
                  </>
                )}
              </button>
            </div>
            {mutation.isError && (
              <p className="mt-3 text-sm text-red-600">
                Une erreur est survenue :{" "}
                {(mutation.error as any).response?.data?.error ||
                  mutation.error.message}
              </p>
            )}
          </div>
        </div>

        {/* Colonne Droite : Résultat */}
        <div className="space-y-4">
          <div className="relative min-h-[300px] rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Résultat</h3>
              {mutation.data?.summary && (
                <button
                  onClick={handleCopy}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                  title="Copier"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 rounded-lg bg-gray-50 p-6 text-sm leading-relaxed text-gray-700 border border-gray-100 overflow-y-auto max-h-[500px]">
              {mutation.data?.summary ? (
                // La classe 'prose' active le style auto pour h1, h2, ul, bold, etc.
                <div className="prose prose-sm max-w-none prose-blue prose-headings:font-semibold prose-p:my-2">
                  <ReactMarkdown>{mutation.data.summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 italic">
                  Le résumé apparaîtra ici...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
