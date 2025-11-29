import { z } from "zod"
import { db } from "../../db"
import { pages, workflows } from "../../db/schema"
import { eq } from "drizzle-orm"

// --- TYPES ---

// Payload envoyé au workflow n8n
export const pageGenerationPayload = z.object({
  userId: z.string(),
  prompt: z.string().optional(),
})

// Result attendu à la fin du workflow
export const pageGenerationResult = z.object({
  title: z.string(),
  content: z.unknown(),
})

export type PageGenerationPayload = z.infer<typeof pageGenerationPayload>
export type PageGenerationResult = z.infer<typeof pageGenerationResult>

// --- SAVE RESULT (crée la page à la fin) ---

export async function savePageGenerationResult(
  workflowId: string,
  result: PageGenerationResult
) {
  // Récupère le userId du payload
  const [workflow] = await db
    .select({ payload: workflows.payload })
    .from(workflows)
    .where(eq(workflows.id, workflowId))

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  const payload = pageGenerationPayload.parse(workflow.payload)

  // Crée la page avec le résultat
  const [newPage] = await db
    .insert(pages)
    .values({
      userId: payload.userId,
      title: result.title,
      content: result.content,
    })
    .returning()

  return { pageId: newPage.id }
}
