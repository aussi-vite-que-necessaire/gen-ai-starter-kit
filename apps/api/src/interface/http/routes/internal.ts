import { Hono } from "hono"
import { zodToJsonSchema } from "zod-to-json-schema"
import { ActionRegistry, ActionName } from "../../../core/processors" // Vérifie ce chemin d'import selon ta structure
import { env } from "../../../env"

const app = new Hono()

// 1. MIDDLEWARE SÉCURITÉ
app.use("*", async (c, next) => {
  const secret = c.req.header("x-internal-secret")
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
})

// 2. DISCOVERY (GET /actions) -> Pour n8n
app.get("/actions", (c) => {
  // On transforme l'objet Registry en Tableau pour n8n
  const actions = Object.entries(ActionRegistry).map(([key, value]) => ({
    name: key,
    slug: key, // ✅ CRITIQUE : n8n a besoin de 'slug' comme value
    description: "Action du registre interne",
    schema: zodToJsonSchema(value.schema),
  }))

  // ✅ CRITIQUE : On renvoie le tableau directement (pas { actions: [...] })
  return c.json(actions)
})

// 3. EXECUTE ACTION (POST /runs/:id/execute)
app.post("/runs/:id/execute", async (c) => {
  // const id = c.req.param("id")
  const { action, payload } = await c.req.json()

  const processor = ActionRegistry[action as ActionName]
  if (!processor) {
    return c.json({ error: `Action '${action}' not found` }, 404)
  }

  try {
    const input = processor.schema.parse(payload)
    // Simule ou exécute l'action
    // const result = await processor.handler(id, input)

    // Pour le test, on renvoie juste que ça a marché
    return c.json({ success: true, processed: true, action, input })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400)
  }
})

export default app
