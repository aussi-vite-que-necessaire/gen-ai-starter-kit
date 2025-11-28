import { Hono } from "hono"
import { zodToJsonSchema } from "zod-to-json-schema"
import { ActionRegistry, ActionName } from "../../../core/processors"
import { env } from "../../../env"

const app = new Hono()

// Middleware sécurité
app.use("*", async (c, next) => {
  const secret = c.req.header("x-internal-secret")
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
})

// Discovery endpoint pour n8n
app.get("/actions", (c) => {
  const actions = Object.entries(ActionRegistry).map(([key, value]) => {
    // @ts-ignore
    const schema = zodToJsonSchema(value.schema, { name: key })

    return {
      name: key,
      slug: key,
      description: "Action du registre interne",
      schema: schema,
    }
  })

  return c.json(actions)
})

// Execute action endpoint
app.post("/runs/:id/execute", async (c) => {
  const id = c.req.param("id")
  const { action, payload } = await c.req.json()

  const processor = ActionRegistry[action as ActionName]
  if (!processor) {
    return c.json({ error: `Action '${action}' not found` }, 404)
  }

  try {
    const input = processor.schema.parse(payload)
    const result = await processor.handler(id, input)
    return c.json({ success: true, ...result })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400)
  }
})

export default app
