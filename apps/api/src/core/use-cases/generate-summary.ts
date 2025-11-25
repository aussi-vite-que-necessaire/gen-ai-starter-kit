// apps/api/src/core/use-cases/generate-summary.ts
import { AIProvider } from "../ports/ai.provider"

// Type de la fonction use-case finale
export type GenerateSummaryUseCase = (text: string) => Promise<string>

/**
 * Factory : Crée le use case en injectant les dépendances.
 */
export const makeGenerateSummary = (ai: AIProvider): GenerateSummaryUseCase => {
  // Retourne la fonction exécutable
  return async (text: string) => {
    // 1. Validation Domain
    if (!text || text.trim().length === 0) {
      throw new Error("Le texte à résumer ne peut pas être vide")
    }

    // 2. Logique Métier (Construction du prompt)
    const prompt = `Tu es un expert en synthèse. Merci de résumer le texte suivant de manière claire et concise, en français :\n\n"${text}"`

    // 3. Appel Infra via le Port
    const summary = await ai.generateText(prompt)

    return summary
  }
}
