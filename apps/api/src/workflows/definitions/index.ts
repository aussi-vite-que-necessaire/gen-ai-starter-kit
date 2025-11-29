import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { workflows } from "../../db/schema"
import {
  pageGenerationPayload,
  pageGenerationResult,
  savePageGenerationResult,
} from "./page-generation"

// Registry des workflows avec leurs types
export const WorkflowDefinitions = {
  "page-generation": {
    payloadSchema: pageGenerationPayload,
    resultSchema: pageGenerationResult,
    saveResult: savePageGenerationResult,
    webhookPath: "generate-page",
  },
} as const

export type WorkflowType = keyof typeof WorkflowDefinitions

// Helper pour vérifier si un type existe
export function isValidWorkflowType(type: string): type is WorkflowType {
  return type in WorkflowDefinitions
}

// --- HELPER GENERIQUE : Mark workflow completed ---

export async function markWorkflowCompleted(
  workflowId: string,
  result: Record<string, unknown>
) {
  // Le result inclut les données n8n + les données créées par saveResult (ex: pageId)
  await db
    .update(workflows)
    .set({
      status: "COMPLETED",
      result,
      displayMessage: "Terminé",
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, workflowId))
}

// Re-export les types
export * from "./page-generation"
