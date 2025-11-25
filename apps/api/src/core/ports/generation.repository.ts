// apps/api/src/core/ports/generation.repository.ts

export type Generation = {
  id: string
  userId: string
  prompt: string
  result: string
  createdAt: Date
}

export interface GenerationRepository {
  /**
   * Sauvegarde une nouvelle génération
   */
  create(data: {
    userId: string
    prompt: string
    result: string
  }): Promise<Generation>

  /**
   * Récupère l'historique d'un utilisateur
   */
  listByUserId(userId: string): Promise<Generation[]>
}
