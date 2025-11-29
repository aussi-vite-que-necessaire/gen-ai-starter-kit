import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { db } from "../db"
import { workflows, workflowStatusEnum } from "../db/schema"
import { env } from "../env"
import {
  WorkflowDefinitions,
  markWorkflowCompleted,
  pageGenerationResult,
} from "../workflows/definitions"

const app = new Hono()

// Middleware securite pour les routes internes (appelees par n8n)
const requireInternalSecret = async (c: any, next: any) => {
  const secret = c.req.header("x-internal-secret")
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
}

// --- ROUTES PUBLIQUES ---

// GET /api/workflows/:id - Status d'un workflow (polling frontend)
app.get("/:id", async (c) => {
  const workflowId = c.req.param("id")

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, workflowId))

  if (!workflow) {
    return c.json({ error: "Workflow not found" }, 404)
  }

  return c.json({ workflow })
})

// --- ROUTES INTERNES (n8n) ---

// Schema pour update-status
const updateStatusSchema = z.object({
  workflowId: z.string().uuid(),
  status: z.enum(["RUNNING"]), // Seulement RUNNING, pas COMPLETED/FAILED
  displayMessage: z.string().optional(),
})

// POST /api/workflows/update-status - Met a jour le status (appelé par n8n)
app.post(
  "/update-status",
  requireInternalSecret,
  zValidator("json", updateStatusSchema),
  async (c) => {
    const { workflowId, status, displayMessage } = c.req.valid("json")

    console.log(`[Workflow] Update status ${workflowId}: ${status}`)

    await db
      .update(workflows)
      .set({
        status,
        displayMessage,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflowId))

    return c.json({ success: true, status })
  }
)

// Schema pour complete
const completeSchema = z.object({
  workflowId: z.string().uuid(),
  result: z.record(z.unknown()),
})

// POST /api/workflows/page-generation/complete - Complete un workflow page
app.post(
  "/page-generation/complete",
  requireInternalSecret,
  zValidator("json", completeSchema),
  async (c) => {
    const { workflowId, result } = c.req.valid("json")

    console.log(`[Workflow] Complete page-generation ${workflowId}`)

    // 1. Valide le result avec le schema typé
    const validResult = pageGenerationResult.parse(result)

    // 2. Sauvegarde dans les tables métier (retourne { pageId })
    const saveResponse = await WorkflowDefinitions[
      "page-generation"
    ].saveResult(workflowId, validResult)

    // 3. Mark workflow completed avec result complet (n8n + pageId)
    await markWorkflowCompleted(workflowId, {
      ...validResult,
      ...saveResponse, // Ajoute pageId au result
    })

    return c.json({ success: true, ...saveResponse })
  }
)

// Schema pour fail
const failSchema = z.object({
  workflowId: z.string().uuid(),
  error: z.string(),
})

// POST /api/workflows/fail - Marque un workflow comme failed
app.post(
  "/fail",
  requireInternalSecret,
  zValidator("json", failSchema),
  async (c) => {
    const { workflowId, error } = c.req.valid("json")

    console.log(`[Workflow] Failed ${workflowId}: ${error}`)

    await db
      .update(workflows)
      .set({
        status: "FAILED",
        error,
        displayMessage: "Erreur",
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflowId))

    return c.json({ success: true, status: "FAILED" })
  }
)

export default app
