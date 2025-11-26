import { registerWorkflow } from "./registry"
import { WorkflowDefinition } from "./types"
// Importe tes workflows ici
// import { landingPageWorkflow } from "./landing-page.workflow";
// import { imageGenWorkflow } from "./image-gen.workflow";

export const loadWorkflows = () => {
  // Liste des workflows à activer
  const workflows: WorkflowDefinition[] = [
    // landingPageWorkflow,
    // imageGenWorkflow
  ]

  workflows.forEach((wf) => {
    registerWorkflow(wf)
    console.log(`✅ Workflow registered: ${wf.id}`)
  })
}
