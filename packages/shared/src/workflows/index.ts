import { z } from "zod"

// =============================================================================
// SCHEMAS - Définir les nouveaux workflows ici
// =============================================================================

// --- PAGE GENERATION ---

export const pageGenerationPayload = z.object({
  userId: z.string(),
  prompt: z.string().optional(),
})

export const pageGenerationResult = z.object({
  title: z.string(),
  content: z.unknown(),
})

export type PageGenerationPayload = z.infer<typeof pageGenerationPayload>
export type PageGenerationResult = z.infer<typeof pageGenerationResult>

// Result final avec pageId (après saveResult côté API)
export type PageGenerationFinalResult = PageGenerationResult & {
  pageId: string
}

// =============================================================================
// REGISTRY - Source de vérité
// =============================================================================

export const workflowSchemas = {
  "page-generation": {
    payload: pageGenerationPayload,
    result: pageGenerationResult,
  },
} as const

// Types dérivés
export type WorkflowType = keyof typeof workflowSchemas

export type WorkflowPayload<T extends WorkflowType> = z.infer<
  (typeof workflowSchemas)[T]["payload"]
>

export type WorkflowResult<T extends WorkflowType> = z.infer<
  (typeof workflowSchemas)[T]["result"]
>

// =============================================================================
// HELPERS
// =============================================================================

export const WORKFLOW_TYPES = Object.keys(workflowSchemas) as WorkflowType[]

export function isValidWorkflowType(type: string): type is WorkflowType {
  return type in workflowSchemas
}
