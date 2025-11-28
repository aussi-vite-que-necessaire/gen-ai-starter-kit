// apps/api/src/core/ports/ai.provider.ts

export interface AIProvider {
  /**
   * Génère une réponse textuelle basée sur un prompt.
   * @param prompt Le texte envoyé à l'IA
   * @throws AIError si la génération échoue
   */
  generateText(prompt: string): Promise<string>
}
