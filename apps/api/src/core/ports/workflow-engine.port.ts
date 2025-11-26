export interface WorkflowEnginePort {
  // Démarre un nouveau workflow
  startWorkflow(
    workflowId: string,
    input: any,
    options?: { parentId?: string; parentStepId?: string }
  ): Promise<string> // Retourne le runId

  // Reprend un workflow en pause (Human input)
  sendEvent(runId: string, eventName: string, data: any): Promise<void>
}
