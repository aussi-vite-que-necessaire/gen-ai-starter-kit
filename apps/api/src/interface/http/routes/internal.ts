import { Hono } from "hono"
import { zodToJsonSchema } from "zod-to-json-schema"
import { ActionRegistry, ActionName } from "../../../core/processors"
import { env } from "../../../env"

const app = new Hono()

// 1. MIDDLEWARE SÉCURITÉ
app.use("*", async (c, next) => {
  const secret = c.req.header("x-internal-secret")
  // On compare avec le secret du .env
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
})

// 2. DISCOVERY (GET /actions) -> Pour n8n
app.get("/actions", (c) => {
  const actions = Object.entries(ActionRegistry).map(([key, value]) => ({
    name: key,
    // On transforme le Zod en JSON Schema pour l'UI de n8n
    schema: zodToJsonSchema(value.schema),
  }))
  return c.json({ actions })
})

// 3. EXECUTE ACTION (POST /runs/:id/execute)
app.post("/runs/:id/execute", async (c) => {
  const id = c.req.param("id")
  const { action, payload } = await c.req.json()

  const processor = ActionRegistry[action as ActionName]
  if (!processor) {
    return c.json({ error: `Action '${action}' not found` }, 404)
  }

  try {
    // Validation stricte
    const input = processor.schema.parse(payload)

    // Exécution
    const result = await processor.handler(id, input)

    return c.json({ success: true, result })
  } catch (error: any) {
    console.error(`Error in action ${action}:`, error)
    return c.json({ success: false, error: error.message }, 400)
  }
})

export default app
