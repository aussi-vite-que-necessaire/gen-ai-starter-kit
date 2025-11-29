import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { db } from "../db"
import { workflows } from "../db/schema"
import { env } from "../env"
import {
  handlers,
  isValidWorkflowType,
  markWorkflowCompleted,
  markWorkflowFailed,
} from "../workflows"

const app = new Hono()

// Middleware securite (appelé par n8n)
app.use("*", async (c, next) => {
  const secret = c.req.header("x-internal-secret")
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
})

// --- SCHEMAS ---

const registerSchema = z.object({
  workflowId: z.string().uuid(),
  executionId: z.string(),
})

const updateStatusSchema = z.object({
  executionId: z.string(),
  displayMessage: z.string(),
})

const completeSchema = z.object({
  executionId: z.string(),
  result: z.record(z.unknown()),
})

const failSchema = z.object({
  executionId: z.string(),
  error: z.string(),
})

// --- HELPER ---

async function findWorkflowByExecutionId(executionId: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.executionId, executionId))
  return workflow
}

// --- ROUTES ---

// POST /api/n8n/register - Le Trigger appelle ça pour associer executionId
app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { workflowId, executionId } = c.req.valid("json")

  console.log(
    `[n8n] Register execution ${executionId} -> workflow ${workflowId}`
  )

  await db
    .update(workflows)
    .set({ executionId, updatedAt: new Date() })
    .where(eq(workflows.id, workflowId))

  return c.json({ success: true })
})

// POST /api/n8n/update-status - Met a jour le displayMessage
app.post(
  "/update-status",
  zValidator("json", updateStatusSchema),
  async (c) => {
    const { executionId, displayMessage } = c.req.valid("json")

    const workflow = await findWorkflowByExecutionId(executionId)
    if (!workflow) {
      return c.json({ error: "Workflow not found" }, 404)
    }

    console.log(`[n8n] Update status ${workflow.id}: ${displayMessage}`)

    await db
      .update(workflows)
      .set({
        displayMessage,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflow.id))

    return c.json({ success: true })
  }
)

// POST /api/n8n/:type/complete - Complete un workflow
app.post("/:type/complete", zValidator("json", completeSchema), async (c) => {
  const type = c.req.param("type")
  const { executionId, result } = c.req.valid("json")

  if (!isValidWorkflowType(type)) {
    return c.json({ error: `Unknown workflow type: ${type}` }, 404)
  }

  const workflow = await findWorkflowByExecutionId(executionId)
  if (!workflow) {
    return c.json({ error: "Workflow not found" }, 404)
  }

  console.log(`[n8n] Complete ${type} ${workflow.id}`)

  const handler = handlers[type]

  // Valide le payload et le result
  const payload = handler.payload.parse(workflow.payload)
  const validResult = handler.result.parse(result)

  // Sauvegarde dans les tables métier
  const saveResponse = await handler.saveResult(payload, validResult)

  // Mark completed avec result complet
  await markWorkflowCompleted(workflow.id, {
    ...validResult,
    ...saveResponse,
  })

  return c.json({ success: true, ...saveResponse })
})

// POST /api/n8n/fail - Marque un workflow comme failed
app.post("/fail", zValidator("json", failSchema), async (c) => {
  const { executionId, error } = c.req.valid("json")

  const workflow = await findWorkflowByExecutionId(executionId)
  if (!workflow) {
    return c.json({ error: "Workflow not found" }, 404)
  }

  console.log(`[n8n] Failed ${workflow.id}: ${error}`)

  await markWorkflowFailed(workflow.id, error)

  return c.json({ success: true })
})

export default app
