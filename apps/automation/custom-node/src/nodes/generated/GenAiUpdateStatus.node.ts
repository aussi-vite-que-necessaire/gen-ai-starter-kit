/**
 * AUTO-GENERATED - DO NOT EDIT
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

export class GenAiUpdateStatus implements INodeType {
  description: INodeTypeDescription = {
    displayName: "GenAI: Update Status",
    name: "genAiUpdateStatus",
    icon: "fa:sync",
    group: ["transform"],
    version: 1,
    description: "Update workflow status and display message",
    defaults: {
      name: "GenAI: Update Status",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Display Message",
        name: "displayMessage",
        type: "string",
        default: "",
        required: true,
        description: "Message shown to the user during workflow execution",
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
      const displayMessage = this.getNodeParameter("displayMessage", i) as string

      const requestOptions: IHttpRequestOptions = {
        method: "POST",
        url: `${baseURL}/api/n8n/update-status`,
        headers: {
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          "Content-Type": "application/json",
        },
        body: { executionId, displayMessage },
        json: true,
      }

      try {
        const response = await this.helpers.request(requestOptions)
        returnData.push({ json: { ...items[i].json, ...response } })
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
