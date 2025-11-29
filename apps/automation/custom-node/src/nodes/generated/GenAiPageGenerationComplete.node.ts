/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: page-generation
 * 
 * Uses n8n execution ID automatically - no workflowId field needed!
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestOptions,
} from "n8n-workflow"

export class GenAiPageGenerationComplete implements INodeType {
  description: INodeTypeDescription = {
    displayName: "GenAI: PageGeneration Complete",
    name: "genAiPageGenerationComplete",
    icon: "fa:check-circle",
    group: ["transform"],
    version: 1,
    description: "Complete a page-generation workflow",
    defaults: {
      name: "GenAI: PageGeneration Complete",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Title",
        name: "title",
        type: "string",
        default: "",
        required: true,
        description: "Field: title",
      },
      {
        displayName: "Content",
        name: "content",
        type: "string",
        default: "",
        required: true,
        description: "Field: content",
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []
    const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000"
    
    // Get execution ID from n8n context
    const executionId = this.getExecutionId()

    for (let i = 0; i < items.length; i++) {
      const result: Record<string, any> = {}
      result["title"] = this.getNodeParameter("title", i)
      result["content"] = this.getNodeParameter("content", i)

      const requestOptions: IHttpRequestOptions = {
        method: "POST",
        url: `${baseURL}/api/n8n/page-generation/complete`,
        headers: {
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          "Content-Type": "application/json",
        },
        body: { executionId, result },
        json: true,
      }

      try {
        const response = await this.helpers.request(requestOptions)
        returnData.push({ json: response })
      } catch (error: any) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        })
      }
    }

    return [returnData]
  }
}
