import { describe, it, expect, vi } from "vitest"
import { makeDeleteGeneration } from "./delete-generation"
import { GenerationRepository } from "../ports/generation.repository"

describe("Use Case: Delete Generation", () => {
  const mockRepo = {
    create: vi.fn(),
    listByUserId: vi.fn(),
    delete: vi.fn(), // Le mock
  } as unknown as GenerationRepository

  const deleteGeneration = makeDeleteGeneration(mockRepo)

  it("devrait appeler le repository avec les bons ID", async () => {
    await deleteGeneration("gen-123", "user-abc")

    expect(mockRepo.delete).toHaveBeenCalledWith("gen-123", "user-abc")
  })
})
