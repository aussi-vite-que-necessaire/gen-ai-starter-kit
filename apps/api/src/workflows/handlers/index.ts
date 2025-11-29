import { pageGenerationHandler } from "./page-generation"

// Registry des handlers
export const handlers = {
  [pageGenerationHandler.id]: pageGenerationHandler,
} as const

export type WorkflowType = keyof typeof handlers

// Helper pour vérifier si un type existe
export function isValidWorkflowType(type: string): type is WorkflowType {
  return type in handlers
}

