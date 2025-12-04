import { eq } from "drizzle-orm"
import { db } from "../db"
import { workflows } from "../db/schema"
import { handlers } from "./handlers"
import { addWorkflowJob } from "./queues"
import { QueueName } from "./config"
import type { WorkflowType } from "@genai/shared/workflows"

// Re-export
export { handlers }
export { isValidWorkflowType, type WorkflowType } from "@genai/shared/workflows"

// --- START WORKFLOW ---

interface StartWorkflowResult {
  workflowId: string
  jobId: string
}

export async function startWorkflow(
  type: WorkflowType,
  payload: Record<string, unknown>
): Promise<StartWorkflowResult> {
  const handler = handlers[type]
  const queueName = (handler.queue ?? "default") as QueueName
  const webhookPath = handler.id // webhookPath = id du workflow

  // 1. Valide le payload
  const validPayload = handler.payload.parse(payload)

  // 2. Crée le workflow en DB
  const [workflow] = await db
    .insert(workflows)
    .values({
      webhookPath,
      payload: validPayload,
      status: "PENDING",
      displayMessage: "En attente...",
    })
    .returning()

  // 3. Ajoute le job BullMQ
  const jobId = await addWorkflowJob(queueName, {
    workflowId: workflow.id,
    webhookPath,
    payload: validPayload,
  })

  console.log(`[Workflow] Started ${type}: ${workflow.id}, job ${jobId}`)

  return {
    workflowId: workflow.id,
    jobId,
  }
}

// --- MARK WORKFLOW COMPLETED ---

export async function markWorkflowCompleted(
  workflowId: string,
  result: Record<string, unknown>
) {
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

// --- MARK WORKFLOW FAILED ---

export async function markWorkflowFailed(workflowId: string, error: string) {
  await db
    .update(workflows)
    .set({
      status: "FAILED",
      error,
      displayMessage: "Erreur",
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, workflowId))
}
