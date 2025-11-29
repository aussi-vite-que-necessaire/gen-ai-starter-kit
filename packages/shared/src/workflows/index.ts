import { z } from "zod"

// =============================================================================
// SCHEMAS
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

// =============================================================================
// REGISTRY
// =============================================================================

export const WORKFLOW_TYPES = ["page-generation"] as const

export type WorkflowType = (typeof WORKFLOW_TYPES)[number]

export const workflowSchemas = {
  "page-generation": {
    payload: pageGenerationPayload,
    result: pageGenerationResult,
  },
} as const satisfies Record<
  WorkflowType,
  { payload: z.ZodType; result: z.ZodType }
>

// =============================================================================
// HELPERS
// =============================================================================

export function isValidWorkflowType(type: string): type is WorkflowType {
  return WORKFLOW_TYPES.includes(type as WorkflowType)
}

export function validatePayload<T extends WorkflowType>(
  type: T,
  payload: unknown
) {
  return workflowSchemas[type].payload.parse(payload)
}

export function validateResult<T extends WorkflowType>(
  type: T,
  result: unknown
) {
  return workflowSchemas[type].result.parse(result)
}
