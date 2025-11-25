// apps/api/src/infra/db/generation.adapter.ts
import { and, desc, eq } from "drizzle-orm"
import { db } from "./index" // Ton instance Drizzle (créée lors du setup initial)
import { generation } from "./schema"
import { GenerationRepository } from "../../core/ports/generation.repository"

export const generationAdapter: GenerationRepository = {
  /**
   * Sauvegarde une génération en DB
   */
  async create(data) {
    const [inserted] = await db
      .insert(generation)
      .values({
        userId: data.userId,
        prompt: data.prompt,
        result: data.result,
      })
      .returning() // PostgreSQL permet de retourner l'objet créé immédiatement

    return inserted
  },

  /**
   * Récupère l'historique par user (du plus récent au plus vieux)
   */
  async listByUserId(userId) {
    const history = await db
      .select()
      .from(generation)
      .where(eq(generation.userId, userId))
      .orderBy(desc(generation.createdAt))

    return history
  },

  async delete(id, userId) {
    await db.delete(generation).where(
      and(
        eq(generation.id, id),
        eq(generation.userId, userId) // Sécurité critique !
      )
    )
  },
}
