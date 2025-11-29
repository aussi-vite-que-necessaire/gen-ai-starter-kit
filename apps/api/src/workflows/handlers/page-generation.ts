import { z } from "zod"
import { db } from "../../db"
import { pages } from "../../db/schema"

// --- SCHEMAS ---

export const payloadSchema = z.object({
  userId: z.string(),
  prompt: z.string().optional(),
})

export const resultSchema = z.object({
  title: z.string(),
  content: z.unknown(),
})

// --- TYPES ---

export type Payload = z.infer<typeof payloadSchema>
export type Result = z.infer<typeof resultSchema>

// --- SAVE RESULT ---

async function saveResult(payload: Payload, result: Result) {
  // Plus besoin de fetch le workflow, on a déjà le payload !
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

// --- HANDLER ---

export const pageGenerationHandler = {
  id: "page-generation" as const,
  queue: "page-generation" as const,
  payloadSchema,
  resultSchema,
  saveResult,
}
