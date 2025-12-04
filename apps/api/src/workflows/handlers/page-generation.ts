import type {
  PageGenerationPayload,
  PageGenerationResult,
} from "@genai/shared/workflows"
import { db } from "../../db.js"
import { pages } from "../../db/schema.js"

// =============================================================================
// SAVE RESULT
// Business logic executed when n8n completes the workflow
// =============================================================================

async function saveResult(
  payload: PageGenerationPayload,
  result: PageGenerationResult
) {
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



// =============================================================================
// HANDLER CONFIG
// API-specific config (queue name, saveResult function)
// Schemas are in @genai/shared and merged in handlers/index.ts
// =============================================================================

export const pageGenerationHandler = {
  id: "page-generation" as const,
  queue: "page-generation" as const,
  saveResult,
}
