import { WorkflowDefinition } from "./types"
// Importe tes workflows ici au fur et à mesure
// import { landingPageWorkflow } from "./landing-page";

export const workflowRegistry = new Map<string, WorkflowDefinition>()

export const registerWorkflow = (wf: WorkflowDefinition) => {
  workflowRegistry.set(wf.id, wf)
}

// Pour l'instant on initialise avec rien, ou tes workflows de test
// registerWorkflow(landingPageWorkflow);
