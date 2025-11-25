import { describe, it, expect, vi } from "vitest"
import { makeGenerateSummary } from "./generate-summary"
import { AIProvider } from "../ports/ai.provider"
import { GenerationRepository } from "../ports/generation.repository"

describe("Use Case: Generate Summary", () => {
  // 1. Mocks
  const mockAI: AIProvider = { generateText: vi.fn() }
  const mockRepo: GenerationRepository = {
    create: vi.fn(),
    listByUserId: vi.fn(),
  }

  // 2. Factory (Maintenant elle prend 2 dépendances)
  const generateSummary = makeGenerateSummary(mockAI, mockRepo)

  it("devrait générer ET sauvegarder le résultat", async () => {
    // Setup
    vi.mocked(mockAI.generateText).mockResolvedValue("Le Résumé")
    vi.mocked(mockRepo.create).mockResolvedValue({
      id: "123",
      userId: "user-1",
      prompt: "input",
      result: "Le Résumé",
      createdAt: new Date(),
    })

    // Execute (On passe maintenant le userId en 2eme arg)
    const result = await generateSummary("Mon texte", "user-1")

    // Verify
    expect(result).toBe("Le Résumé")
    // Vérifie que la sauvegarde a été appelée
    expect(mockRepo.create).toHaveBeenCalledWith({
      userId: "user-1",
      prompt: expect.stringContaining("Mon texte"), // On sauvegarde le prompt original
      result: "Le Résumé",
    })
  })
})
