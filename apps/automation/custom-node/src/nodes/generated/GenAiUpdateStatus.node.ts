/**
 * AUTO-GENERATED - DO NOT EDIT
 * 
 * Uses workflowId from staticData (stored by Trigger)
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
    displayName: "@ Update Status",
    name: "genAiUpdateStatus",
    icon: "fa:sync",
    group: ["transform"],
    version: 1,
    description: "Update workflow status and display message",
    defaults: {
      name: "@ Update Status",
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
    
    // Get workflowId from static data (stored by Trigger)
    const staticData = this.getWorkflowStaticData("global")
    const workflowId = staticData.__genai_workflowId as string
    
    if (!workflowId) {
      throw new Error("workflowId not found in staticData. Make sure the GenAI Trigger is used.")
    }

    for (let i = 0; i < items.length; i++) {
      const displayMessage = this.getNodeParameter("displayMessage", i) as string

      const requestOptions: IHttpRequestOptions = {
        method: "POST",
        url: `${baseURL}/api/n8n/update-status`,
        headers: {
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          "Content-Type": "application/json",
        },
        body: { workflowId, displayMessage },
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
