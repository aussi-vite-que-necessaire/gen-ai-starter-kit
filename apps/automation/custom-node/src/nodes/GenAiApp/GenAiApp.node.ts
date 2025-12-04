import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  IHttpRequestOptions,
  INodeProperties,
} from "n8n-workflow"

export class GenAiApp implements INodeType {
  description: INodeTypeDescription = {
    displayName: "GenAI App",
    name: "genAiApp",
    icon: "fa:robot",
    group: ["transform"],
    version: 1,
    description: "Interact with the GenAI SaaS API (Internal)",
    defaults: {
      name: "GenAI App",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      // 1. RUN ID
      {
        displayName: "Run ID",
        name: "runId",
        type: "string",
        default: "={{ $json.id }}",
        required: true,
        description: "The ID of the run to execute the action on",
      },

      // 2. ACTION (Dynamic Dropdown)
      {
        displayName: "Action",
        name: "actionSlug",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getActions",
        },
        default: "",
        required: true,
        description: "The action to execute",
      },

      // 3. FIELDS for update-status
      {
        displayName: "Status",
        name: "field_status",
        type: "string",
        default: "",
        required: true,
        description: "Le statut technique (ex: GENERATING, COMPLETED)",
        displayOptions: {
          show: {
            actionSlug: ["update-status"],
          },
        },
      },
      {
        displayName: "Display Message",
        name: "field_displayMessage",
        type: "string",
        default: "",
        description: "Message pour l'utilisateur",
        displayOptions: {
          show: {
            actionSlug: ["update-status"],
          },
        },
      },

      // 4. FIELDS for test-action
      {
        displayName: "Title",
        name: "field_title",
        type: "string",
        default: "",
        required: true,
        description: "The title of the post",
        displayOptions: {
          show: {
            actionSlug: ["test-action"],
          },
        },
      },
      {
        displayName: "Content",
        name: "field_content",
        type: "string",
        default: "",
        required: true,
        description: "The content of the post",
        displayOptions: {
          show: {
            actionSlug: ["test-action"],
          },
        },
      },
      {
        displayName: "Published",
        name: "field_published",
        type: "boolean",
        default: false,
        description: "Is it published?",
        displayOptions: {
          show: {
            actionSlug: ["test-action"],
          },
        },
      },
      {
        displayName: "Tags",
        name: "field_tags",
        type: "string",
        default: "",
        required: true,
        description: "Tags for the post (comma separated)",
        displayOptions: {
          show: {
            actionSlug: ["test-action"],
          },
        },
      },
    ],
  }

  methods = {
    loadOptions: {
      async getActions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        const baseURL =
          process.env.GENAI_API_URL || "http://host.docker.internal:3000"
        const options: IHttpRequestOptions = {
          method: "GET",
          url: `${baseURL}/api/internal/actions`,
          headers: {
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
            "Content-Type": "application/json",
          },
          json: true,
        }

        try {
          const response = await this.helpers.request(options)
          return (response || []).map((action: { name: string; slug: string }) => ({
            name: action.name,
            value: action.slug,
          }))
        } catch {
          return []
        }
      },
    },
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const baseURL =
      process.env.GENAI_API_URL || "http://host.docker.internal:3000"

    for (let i = 0; i < items.length; i++) {
      const runId = this.getNodeParameter("runId", i) as string
      const actionSlug = this.getNodeParameter("actionSlug", i) as string

      // Build payload from field_ parameters
      const payload: Record<string, unknown> = {}
      const nodeParams = this.getNode().parameters

      for (const [key] of Object.entries(nodeParams)) {
        if (key.startsWith("field_")) {
          const fieldName = key.replace("field_", "")
          const fieldValue = this.getNodeParameter(key, i)
          if (fieldValue !== undefined && fieldValue !== "") {
            // Handle tags as array
            if (fieldName === "tags" && typeof fieldValue === "string") {
              payload[fieldName] = fieldValue
                .split(",")
                .map((t: string) => t.trim())
            } else {
              payload[fieldName] = fieldValue
            }
          }
        }
      }

      const requestOptions: IHttpRequestOptions = {
        method: "POST",
        url: `${baseURL}/api/internal/runs/${runId}/execute`,
        headers: {
          "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          "Content-Type": "application/json",
        },
        body: {
          action: actionSlug,
          payload: payload,
        },
        json: true,
      }

      try {
        const response = await this.helpers.request(requestOptions)
        returnData.push({ json: response })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        returnData.push({
          json: { error: errorMessage },
          pairedItem: { item: i },
        })
      }
    }

    return [returnData]
  }
}
