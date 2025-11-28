import { GenerationRepository } from "../ports/generation.repository"

export const makeListHistory = (repo: GenerationRepository) => {
  return async (userId: string) => {
    // Ici, on pourrait ajouter de la logique (ex: cacher certains champs)
    return await repo.listByUserId(userId)
  }
}
