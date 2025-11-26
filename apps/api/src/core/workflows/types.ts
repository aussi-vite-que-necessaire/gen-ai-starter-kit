import { z } from "zod"

// --- Primitives ---

export type WorkflowContext<TInput = any, THistory = any> = {
  runId: string
  input: TInput // L'input initial du workflow
  history: THistory // Les outputs des étapes précédentes: { stepName: output }
  // On pourra ajouter userId, helpers, etc.
}

// --- Commandes spéciales (ce que retourne une étape) ---

export type StepResult<TOutput = any> =
  | { type: "DONE"; payload: TOutput }
  | { type: "SPAWN"; workflowName: string; inputs: any[] } // Lance N enfants
  | { type: "WAIT_EVENT"; eventName: string; timeout?: string } // Attend un humain
  | { type: "FAIL"; error: string }

// --- Définition d'une Étape ---

export type StepFunction<TInput = any, TOutput = any> = (
  context: WorkflowContext<TInput>
) => Promise<TOutput | StepResult<TOutput>>

export type WorkflowStepDef<TInput = any> = {
  id: string
  run: StepFunction<TInput> // <--- On l'utilise ici ! (C'est ça qui type le ctx.input)
  next?: string | null
}

// --- Définition d'un Workflow ---

export type WorkflowDefinition<TInput = any> = {
  id: string
  steps: Record<string, WorkflowStepDef<TInput>> // <--- On propage le type
  initialStep: string
}

// --- Helper pour l'DX (Syntax Sugar) ---
// Permet de retourner juste la data sans wrapper dans { type: "DONE" } par défaut
export const step = <T>(output: T) => ({
  type: "DONE" as const,
  payload: output,
})

export const spawn = (workflowName: string, inputs: any[]) => ({
  type: "SPAWN" as const,
  workflowName,
  inputs,
})

export const waitForEvent = (
  eventName: string,
  options?: { timeout: string }
) => ({
  type: "WAIT_EVENT" as const,
  eventName,
  timeout: options?.timeout,
})
