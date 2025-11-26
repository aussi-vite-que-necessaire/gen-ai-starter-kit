import { createMiddleware } from "hono/factory"
import { auth } from "../../../infra/auth"

// On définit le type des variables injectées dans le contexte Hono
type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  // Magie : On injecte l'user dans le contexte
  c.set("user", session.user)
  c.set("session", session.session)

  await next()
})
