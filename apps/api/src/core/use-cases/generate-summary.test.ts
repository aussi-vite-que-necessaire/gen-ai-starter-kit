// apps/api/src/core/use-cases/generate-summary.test.ts
import { describe, it, expect, vi } from "vitest"
import { makeGenerateSummary } from "./generate-summary" // N'existe pas encore
import { AIProvider } from "../ports/ai.provider"

describe("Use Case: Generate Summary", () => {
  // 1. Mock de l'infrastructure
  const mockAIProvider: AIProvider = {
    generateText: vi.fn(),
  }

  // 2. Création de l'instance du Use Case (Injection)
  const generateSummary = makeGenerateSummary(mockAIProvider)

  it("devrait appeler le AIProvider avec un prompt formaté", async () => {
    // Setup
    const input = "Voici un long texte à résumer..."
    const expectedSummary = "Résumé court."
    vi.mocked(mockAIProvider.generateText).mockResolvedValue(expectedSummary)

    // Execute
    const result = await generateSummary(input)

    // Verify
    expect(result).toBe(expectedSummary)
    expect(mockAIProvider.generateText).toHaveBeenCalledWith(
      expect.stringContaining(input) // Vérifie que l'input est bien dans le prompt
    )
    expect(mockAIProvider.generateText).toHaveBeenCalledWith(
      expect.stringContaining("résume") // Vérifie qu'on a bien donné une instruction
    )
  })

  it("devrait rejeter une erreur si le texte est vide", async () => {
    await expect(generateSummary("")).rejects.toThrow(
      "Le texte à résumer ne peut pas être vide"
    )
    await expect(generateSummary("   ")).rejects.toThrow(
      "Le texte à résumer ne peut pas être vide"
    )
  })
})
