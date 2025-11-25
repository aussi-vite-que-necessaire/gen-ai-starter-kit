import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

// On charge les variables directement ici
dotenv.config()

export default defineConfig({
  schema: "./src/infra/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // On utilise process.env direct avec un '!' pour dire "t'inquiète, ça existe"
    url: process.env.DATABASE_URL!,
  },
})
