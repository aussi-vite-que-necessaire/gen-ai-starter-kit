import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { auth, requireAuth } from "../auth"
import { db } from "../db"
import { workflows } from "../db/schema"
import { startWorkflow, handlers, isValidWorkflowType } from "../workflows"

// Type pour le contexte Hono avec user
type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}

const app = new Hono<Env>()

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

// --- ROUTES AUTHENTIFIÉES ---

app.use("/start", requireAuth)

// POST /api/workflows/start - Lance un workflow (générique)
app.post(
  "/start",
  zValidator(
    "json",
    z.object({
      type: z.string(),
      payload: z.record(z.unknown()),
    })
  ),
  async (c) => {
    const userId = c.var.user.id
    const { type, payload } = c.req.valid("json")

    if (!isValidWorkflowType(type)) {
      return c.json({ error: `Unknown workflow type: ${type}` }, 400)
    }

    // Injecte le userId dans le payload (sécurité)
    const { workflowId, jobId } = await startWorkflow(type, {
      ...payload,
      userId,
    })

    return c.json({ success: true, workflowId, jobId }, 201)
  }
)

export default app
