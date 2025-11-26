import { Queue, Worker, FlowProducer, Job } from "bullmq"
import { eq } from "drizzle-orm"
import { NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schema from "../db/schema"
import { WorkflowEnginePort } from "../../core/ports/workflow-engine.port"
import { workflowRegistry } from "../../core/workflows/registry"
import { StepResult, WorkflowContext } from "../../core/workflows/types"

// Types pour les données qui transitent dans Redis
type JobData = {
  runId: string
  workflowId: string
  stepId: string
}

export class BullMQWorkflowEngine implements WorkflowEnginePort {
  private queue: Queue
  private flowProducer: FlowProducer
  private db: NodePgDatabase<typeof schema>
  private redisUrl: string

  constructor(redisUrl: string, db: NodePgDatabase<typeof schema>) {
    this.redisUrl = redisUrl // <--- 2. SAUVEGARDER L'URL ICI
    const connection = { url: redisUrl }
    this.queue = new Queue("workflow-queue", { connection })
    this.flowProducer = new FlowProducer({ connection })
    this.db = db
  }

  // --- 1. Démarrage d'un Workflow ---
  async startWorkflow(
    workflowId: string,
    input: any,
    options: { parentId?: string; parentStepId?: string } = {}
  ): Promise<string> {
    const def = workflowRegistry.get(workflowId)
    if (!def) throw new Error(`Workflow ${workflowId} not found in registry`)

    // 1. Créer l'entrée en DB
    const [run] = await this.db
      .insert(schema.workflowRuns)
      .values({
        workflowId,
        input,
        parentId: options.parentId,
        parentStepId: options.parentStepId,
        status: "RUNNING",
        context: {}, // Historique vide au début
      })
      .returning()

    // 2. Ajouter le Job initial à BullMQ
    await this.queue.add("process-step", {
      runId: run.id,
      workflowId,
      stepId: def.initialStep,
    })

    return run.id
  }

  // --- 2. Reprise après événement Humain ---
  async sendEvent(runId: string, eventName: string, data: any): Promise<void> {
    // 1. Récupérer le run
    const run = await this.db.query.workflowRuns.findFirst({
      where: eq(schema.workflowRuns.id, runId),
    })
    if (!run || run.status !== "WAITING_FOR_INPUT") {
      throw new Error(`Workflow ${runId} is not waiting for input`)
    }

    const def = workflowRegistry.get(run.workflowId)
    if (!def) throw new Error("Def not found")

    // 2. Trouver l'étape qui attendait (On suppose que c'est la dernière exécutée)
    // Astuce : On stocke l'étape en attente dans le context ou on la déduit.
    // Pour simplifier ici, on va chercher l'étape suivante définie dans le registre.
    // (Dans une version avancée, on stockerait "currentStepId" en DB)

    // NOTE : Pour ce MVP, on assume que l'event relance la logique.
    // On va stocker la data de l'event dans le context pour que l'étape suivante puisse la lire.
    const newContext = {
      ...(run.context as Record<string, any>),
      eventData: data,
    }

    await this.db
      .update(schema.workflowRuns)
      .set({
        status: "RUNNING",
        context: newContext,
      })
      .where(eq(schema.workflowRuns.id, runId))

    // 3. On relance le moteur.
    // Attention : Il faut savoir QUELLE étape relancer.
    // Simplification : On relance une étape spéciale "resume" ou l'étape suivante.
    // Pour l'instant, disons qu'on a stocké "nextStepAfterWait" dans le context.
    // (À affiner selon ton besoin exact).
  }

  // --- 3. Le WORKER (À lancer au démarrage de l'app) ---
  createWorker() {
    return new Worker(
      "workflow-queue",
      async (job: Job<JobData>) => {
        const { runId, workflowId, stepId } = job.data
        console.log(`[Worker] Processing ${workflowId} : ${stepId}`)

        // A. Charger l'état
        const run = await this.db.query.workflowRuns.findFirst({
          where: eq(schema.workflowRuns.id, runId),
        })
        if (!run) throw new Error("Run not found")

        const def = workflowRegistry.get(workflowId)
        const stepDef = def?.steps[stepId]
        if (!stepDef) throw new Error(`Step ${stepId} not found`)

        // B. Exécuter le code métier
        const context: WorkflowContext = {
          runId,
          input: run.input,
          history: run.context as any,
        }

        // On update le status de l'étape
        const [stepRecord] = await this.db
          .insert(schema.workflowSteps)
          .values({
            runId,
            stepId,
            status: "RUNNING",
            input: run.context,
            startedAt: new Date(),
          })
          .returning()

        let result: StepResult | any
        try {
          // Exécution réelle de la fonction TS
          const output = await stepDef.run(context)

          // Normalisation du résultat (si l'utilisateur retourne juste de la data)
          if (
            output &&
            typeof output === "object" &&
            "type" in output &&
            (output.type === "DONE" ||
              output.type === "SPAWN" ||
              output.type === "WAIT_EVENT")
          ) {
            result = output
          } else {
            result = { type: "DONE", payload: output }
          }
        } catch (err: any) {
          console.error(err)
          await this.db
            .update(schema.workflowSteps)
            .set({ status: "FAILED", error: err.message })
            .where(eq(schema.workflowSteps.id, stepRecord.id))
          throw err // BullMQ va gérer le retry
        }

        // C. Gérer le résultat

        // 1. Succès (DONE)
        if (result.type === "DONE") {
          // Update History Global
          const newHistory = {
            ...(run.context as object),
            [stepId]: result.payload,
          }
          await this.db
            .update(schema.workflowRuns)
            .set({ context: newHistory })
            .where(eq(schema.workflowRuns.id, runId))

          // Update Step
          await this.db
            .update(schema.workflowSteps)
            .set({
              status: "COMPLETED",
              output: result.payload,
              completedAt: new Date(),
            })
            .where(eq(schema.workflowSteps.id, stepRecord.id))

          // Trigger Next ?
          if (stepDef.next) {
            await this.queue.add("process-step", {
              runId,
              workflowId,
              stepId: stepDef.next,
            })
          } else {
            // Fin du workflow
            await this.db
              .update(schema.workflowRuns)
              .set({
                status: "COMPLETED",
                result: newHistory,
                updatedAt: new Date(),
              })
              .where(eq(schema.workflowRuns.id, runId))
          }
        }

        // 2. Spawn (Flows)
        else if (result.type === "SPAWN") {
          // Ici, on utiliserait this.flowProducer pour créer un arbre de dépendance.
          // Le parent serait le job de l'étape SUIVANTE (stepDef.next).
          // Les enfants seraient les startWorkflow des sous-processus.

          // Pour faire simple dans cette V1 :
          // On lance les enfants en "fire and forget" ou on update le status
          // et on implémentera la logique Flow complète à la prochaine itération.
          console.log(
            "SPAWN requested - To be implemented fully with FlowProducer"
          )
        }

        // 3. Wait Event
        else if (result.type === "WAIT_EVENT") {
          await this.db
            .update(schema.workflowRuns)
            .set({ status: "WAITING_FOR_INPUT" })
            .where(eq(schema.workflowRuns.id, runId))

          // On s'arrête là. Pas de next step.
        }

        return { success: true }
      },
      { connection: { url: this.redisUrl } }
    )
  }
}
