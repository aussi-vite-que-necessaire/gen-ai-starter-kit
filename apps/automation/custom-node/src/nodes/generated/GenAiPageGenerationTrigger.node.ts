/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: page-generation
 * 
 * This trigger automatically registers the n8n execution ID with the API.
 * All subsequent nodes can use $execution.id to identify the workflow.
 */

import {
  IWebhookFunctions,
  IWebhookResponseData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestOptions,
} from "n8n-workflow"

export class GenAiPageGenerationTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "GenAI: PageGeneration Trigger",
    name: "genAiPageGenerationTrigger",
    icon: "fa:bolt",
    group: ["trigger"],
    version: 1,
    description: "Triggered when a page-generation workflow is started",
    defaults: {
      name: "GenAI: PageGeneration Trigger",
    },
    inputs: [],
    outputs: ["main"],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        path: "page-generation",
        responseMode: "onReceived",
      },
    ],
    properties: [],
  }

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject()
    const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000"
    
    // Validate internal secret
    const secret = req.headers["x-internal-secret"]
    const expectedSecret = process.env.INTERNAL_API_SECRET
    
    if (!expectedSecret || secret !== expectedSecret) {
      return { webhookResponse: { error: "Unauthorized" } }
    }

    const body = this.getBodyData() as {
      workflowId: string
      payload: Record<string, unknown>
    }

    // Get n8n execution ID
    const executionId = this.getMode() === "manual" 
      ? `manual-${Date.now()}` 
      : (this as any).getExecutionId?.() || `exec-${Date.now()}`

    // Auto-register execution ID with API
    try {
      const registerOptions: IHttpRequestOptions = {
        method: "POST",
        url: `${baseURL}/api/n8n/register`,
        headers: {
          "x-internal-secret": expectedSecret,
          "Content-Type": "application/json",
        },
        body: {
          workflowId: body.workflowId,
          executionId: executionId,
        },
        json: true,
      }
      await this.helpers.request(registerOptions)
    } catch (error) {
      console.error("Failed to register execution:", error)
    }

    // Output payload (no workflowId needed - use $execution.id)
    return {
      workflowData: [
        [{ json: body.payload as any }],
      ],
    }
  }
}
