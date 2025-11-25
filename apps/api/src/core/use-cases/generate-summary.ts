import { AIProvider } from "../ports/ai.provider"
import { GenerationRepository } from "../ports/generation.repository"

// Signature mise à jour : prend userId en plus
export type GenerateSummaryUseCase = (
  text: string,
  userId: string
) => Promise<string>

export const makeGenerateSummary = (
  ai: AIProvider,
  repo: GenerationRepository // Nouvelle dépendance injectée
): GenerateSummaryUseCase => {
  return async (text: string, userId: string) => {
    if (!text || text.trim().length === 0) {
      throw new Error("Le texte à résumer ne peut pas être vide")
    }

    // 1. Génération IA
    const promptSystem = `Tu es un expert en synthèse. Merci de résumer le texte suivant de manière claire et concise, en français :\n\n"${text}"`
    const summary = await ai.generateText(promptSystem)

    // 2. Sauvegarde en DB (Side Effect contrôlé)
    await repo.create({
      userId,
      prompt: text, // On sauvegarde le texte original
      result: summary,
    })

    return summary
  }
}
