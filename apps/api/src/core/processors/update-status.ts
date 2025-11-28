import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "../../infra/db"
import { generation } from "../../infra/db/schema"

// 1. Le Contrat (Ce que n8n doit envoyer)
export const updateStatusSchema = z.object({
  status: z
    .string()
    .describe("Le statut technique (ex: GENERATING, COMPLETED)"),
  displayMessage: z.string().optional().describe("Message pour l'utilisateur"),
})

// 2. La Logique
export const updateStatusAction = async (
  generationId: string,
  input: z.infer<typeof updateStatusSchema>
) => {
  console.log(`[Action] Update Status for ${generationId}: ${input.status}`)

  await db
    .update(generation)
    .set({
      status: input.status,
      displayMessage: input.displayMessage,
      updatedAt: new Date(),
    })
    .where(eq(generation.id, generationId))

  return { success: true, newStatus: input.status }
}
