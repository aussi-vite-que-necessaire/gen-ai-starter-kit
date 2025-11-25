import { GenerationRepository } from "../ports/generation.repository"

export const makeDeleteGeneration = (repo: GenerationRepository) => {
  return async (id: string, userId: string) => {
    // Ici, on pourrait ajouter une vérification supplémentaire si besoin
    await repo.delete(id, userId)
  }
}
