import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ILoadOptionsFunctions,
  INodePropertyOptions,
  ResourceMapperFields,
  ResourceMapperField,
  IHttpRequestOptions,
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
      // 1. OPERATION
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [{ name: "Execute Action", value: "executeAction" }],
        default: "executeAction",
      },
      // 2. RUN ID
      {
        displayName: "Run ID",
        name: "runId",
        type: "string",
        default: "{{ $json.id }}",
        required: true,
        displayOptions: { show: { operation: ["executeAction"] } },
      },
      // 3. ACTION
      {
        displayName: "Action",
        name: "actionSlug",
        type: "options",
        typeOptions: { loadOptionsMethod: "getActions" },
        default: "",
        required: true,
        displayOptions: { show: { operation: ["executeAction"] } },
      },
      // 4. MAPPING (Auto Only - Best Practice pour ton use case)
      {
        displayName: "Fields",
        name: "fields",
        type: "resourceMapper",
        default: { mappingMode: "define", value: null },
        required: true,
        typeOptions: {
          loadOptionsDependsOn: ["actionSlug"],
          loadOptionsMethod: "getMappingFields",
        },
        displayOptions: { show: { operation: ["executeAction"] } },
      },
    ],
  }

  methods = {
    loadOptions: {
      async getActions(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        // Utilisation du helper natif n8n pour la requête HTTP
        // Note: Dans Docker, host.docker.internal est souvent nécessaire,
        // mais on peut aussi passer par l'env var définie dans docker-compose
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
          return (response || []).map((action: any) => ({
            name: action.name,
            value: action.slug,
          }))
        } catch (error) {
          console.error("Error loading actions:", error)
          return []
        }
      },
    },

    resourceMapping: {
      async getMappingFields(
        this: ILoadOptionsFunctions
      ): Promise<ResourceMapperFields> {
        const actionSlug = this.getNodeParameter("actionSlug") as string
        const baseURL =
          process.env.GENAI_API_URL || "http://host.docker.internal:3000"

        console.log(
          `🚀 [GenAI Node] Loading fields for ${actionSlug} via ${baseURL}`
        )

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
          const actions = Array.isArray(response) ? response : []
          const selectedAction = actions.find((a: any) => a.slug === actionSlug)

          if (
            !selectedAction ||
            !selectedAction.schema ||
            !selectedAction.schema.properties
          ) {
            throw new Error(`Schema not found for action: ${actionSlug}`)
          }

          const properties = selectedAction.schema.properties

          const fields: ResourceMapperField[] = Object.keys(properties).map(
            (key) => {
              const prop = properties[key]
              return {
                id: key,
                displayName: key.charAt(0).toUpperCase() + key.slice(1),
                required:
                  selectedAction.schema.required?.includes(key) || false,
                defaultMatch: false,
                display: true,
                type: "string",
                options: prop.enum?.map((v: string) => ({ name: v, value: v })),
              }
            }
          )

          return { fields }
        } catch (error: any) {
          console.error("Error fetching fields:", error)
          throw new Error(`Failed to fetch fields: ${error.message}`)
        }
      },
    },
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []
    const secret = process.env.INTERNAL_API_SECRET
    const baseURL =
      process.env.GENAI_API_URL || "http://host.docker.internal:3000"

    for (let i = 0; i < items.length; i++) {
      try {
        const runId = this.getNodeParameter("runId", i) as string
        const actionSlug = this.getNodeParameter("actionSlug", i) as string

        // Récupération propre du Resource Mapper
        const mappedData = this.getNodeParameter("fields", i) as any
        const payload = mappedData.value || {}

        const options: IHttpRequestOptions = {
          method: "POST",
          url: `${baseURL}/api/internal/runs/${runId}/execute`,
          body: { action: actionSlug, payload },
          headers: {
            "x-internal-secret": secret || "",
            "Content-Type": "application/json",
          },
          json: true,
        }

        const response = await this.helpers.request(options)
        returnData.push({ json: response })
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } })
        } else {
          throw error
        }
      }
    }
    return [returnData]
  }
}
