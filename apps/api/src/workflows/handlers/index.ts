import {
  workflowSchemas,
  isValidWorkflowType,
  type WorkflowType,
} from "@genai/shared/workflows"
import { pageGenerationHandler } from "./page-generation.js"

// =============================================================================
// HANDLERS REGISTRY
// Extends shared schemas with API-specific logic (saveResult, queue config)
// =============================================================================

export const handlers = {
  "page-generation": {
    ...workflowSchemas["page-generation"],
    ...pageGenerationHandler,
  },
} as const

// Re-export from shared (single source of truth)
export { isValidWorkflowType, type WorkflowType }
