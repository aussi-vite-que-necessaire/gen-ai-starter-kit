import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core"

// --- TABLES BETTER-AUTH ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
})

// --- Table Métier : Generations ---
export const generation = pgTable("generation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id), // Lien avec l'utilisateur (Clé étrangère)
  prompt: text("prompt").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Enum pour les statuts
export const workflowStatusEnum = pgEnum("workflow_status", [
  "PENDING",
  "RUNNING",
  "WAITING_FOR_INPUT", // Pause (Humain)
  "WAITING_CHILDREN", // Pause (Sous-workflows)
  "COMPLETED",
  "FAILED",
])

export const workflowRuns = pgTable(
  "workflow_run",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").references(() => user.id), // Optionnel: pour lier à un user

    workflowId: text("workflow_id").notNull(), // ex: "landing-page-generator"
    status: workflowStatusEnum("status").default("PENDING").notNull(),

    // Pour le pattern Parent/Child
    parentId: uuid("parent_id"),
    parentStepId: text("parent_step_id"), // L'étape du parent qui a spawn

    // Mémoire globale du workflow (Context)
    context: jsonb("context").default({}),

    input: jsonb("input").notNull(), // L'input initial
    result: jsonb("result"), // Le résultat final si fini
    error: text("error"), // Message d'erreur si failed

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    parentIdx: index("workflow_run_parent_idx").on(t.parentId),
  })
)

export const workflowSteps = pgTable(
  "workflow_step",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .references(() => workflowRuns.id)
      .notNull(),

    stepId: text("step_id").notNull(), // ex: "generate-copy"
    status: workflowStatusEnum("status").default("PENDING").notNull(),

    input: jsonb("input"), // Ce qui est rentré dans l'étape
    output: jsonb("output"), // Ce qui est sorti de l'étape
    error: text("error"),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (t) => ({
    runIdx: index("workflow_step_run_idx").on(t.runId),
  })
)
