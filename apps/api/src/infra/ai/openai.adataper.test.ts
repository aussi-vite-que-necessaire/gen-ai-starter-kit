import { describe, it, expect, vi, beforeEach } from "vitest"
import { openaiAdapter } from "./openai.adapter"

// 1. On utilise vi.hoisted pour créer le mock AVANT le hoisting du vi.mock
const mocks = vi.hoisted(() => {
  return {
    create: vi.fn(),
  }
})

// 2. On Mock le module
vi.mock("openai", () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: mocks.create, // On référence l'objet hoisted
        },
      }
    },
  }
})

describe("Infra: OpenAI Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("devrait appeler OpenAI avec les bons paramètres et retourner le texte", async () => {
    // A. Setup
    const mockResponse = {
      choices: [{ message: { content: "Ceci est une réponse IA." } }],
    }
    mocks.create.mockResolvedValue(mockResponse)

    // B. Execute
    const result = await openaiAdapter.generateText("Mon prompt")

    // C. Verify
    expect(result).toBe("Ceci est une réponse IA.")
    expect(mocks.create).toHaveBeenCalledWith({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Mon prompt" }],
      temperature: 0.7,
    })
  })

  it("devrait gérer les erreurs de l'API OpenAI proprement", async () => {
    // A. Setup Error
    mocks.create.mockRejectedValue(new Error("Rate Limit"))

    // B. Verify Error Throw
    await expect(openaiAdapter.generateText("Test")).rejects.toThrow(
      "Erreur de communication avec le service IA"
    )
  })

  it("devrait retourner une chaine vide si OpenAI renvoie null", async () => {
    // Cas limite
    mocks.create.mockResolvedValue({
      choices: [{ message: { content: null } }],
    })

    const result = await openaiAdapter.generateText("Test")
    expect(result).toBe("")
  })
})
