import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db" // Ton instance DB existante
import { env } from "../env"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // Postgres
  }),
  emailAndPassword: {
    enabled: true, // On active Email/Password pour commencer
  },
  // On ajoutera GitHub/Google ici plus tard
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL], // Sécurité CORS
})
