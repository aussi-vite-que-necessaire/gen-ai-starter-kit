/**
 * Script pour générer les nodes n8n à partir des workflow schemas
 * Usage: npx tsx scripts/generate-nodes.ts
 */

import * as fs from "fs"
import * as path from "path"

const SCRIPT_DIR = __dirname
const OUTPUT_DIR = path.join(SCRIPT_DIR, "../src/nodes/generated")
const SHARED_PATH = path.join(
  SCRIPT_DIR,
  "../../../../packages/shared/src/workflows/index.ts"
)

// =============================================================================
// PARSE SCHEMAS FROM SOURCE FILE
// =============================================================================

interface WorkflowDef {
  name: string
  resultFields: { name: string; type: string }[]
}

function parseWorkflowSchemas(): WorkflowDef[] {
  const source = fs.readFileSync(SHARED_PATH, "utf-8")
  const workflows: WorkflowDef[] = []

  const registryMatch = source.match(
    /export const workflowSchemas = \{([^}]+(?:\{[^}]*\}[^}]*)*)\}/
  )
  if (!registryMatch) {
    throw new Error("Could not find workflowSchemas in source")
  }

  const workflowMatches = registryMatch[1].matchAll(/"([^"]+)":\s*\{/g)
  for (const match of workflowMatches) {
    const workflowName = match[1]

    const schemaRegex = new RegExp(
      `const\\s+${workflowName.replace(/-([a-z])/g, (_, c) =>
        c.toUpperCase()
      )}Result\\s*=\\s*z\\.object\\(\\{([^}]+)\\}\\)`,
      "i"
    )

    const schemaMatch = source.match(schemaRegex)
    const resultFields: { name: string; type: string }[] = []

    if (schemaMatch) {
      const fieldsStr = schemaMatch[1]
      const fieldMatches = fieldsStr.matchAll(/(\w+):\s*z\.(\w+)/g)

      for (const fieldMatch of fieldMatches) {
        const fieldName = fieldMatch[1]
        const zodType = fieldMatch[2]

        let n8nType = "string"
        if (zodType === "number") n8nType = "number"
        else if (zodType === "boolean") n8nType = "boolean"

        resultFields.push({ name: fieldName, type: n8nType })
      }
    }

    workflows.push({ name: workflowName, resultFields })
  }

  return workflows
}

// =============================================================================
// HELPERS
// =============================================================================

function pascalCase(str: string): string {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")
}

function getDefaultValue(type: string): string {
  if (type === "string") return '""'
  if (type === "number") return "0"
  if (type === "boolean") return "false"
  return '""'
}

// =============================================================================
// GENERATE TRIGGER NODE (with auto-register)
// =============================================================================

function generateTriggerNode(workflow: WorkflowDef): string {
  const className = `GenAi${pascalCase(workflow.name)}Trigger`
  const displayName = `GenAI: ${pascalCase(workflow.name)} Trigger`
  const nodeName = `genAi${pascalCase(workflow.name)}Trigger`

  return `/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: ${workflow.name}
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

export class ${className} implements INodeType {
  description: INodeTypeDescription = {
    displayName: "${displayName}",
    name: "${nodeName}",
    icon: "fa:bolt",
    group: ["trigger"],
    version: 1,
    description: "Triggered when a ${workflow.name} workflow is started",
    defaults: {
      name: "${displayName}",
    },
    inputs: [],
    outputs: ["main"],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        path: "${workflow.name}",
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
      ? \`manual-\${Date.now()}\` 
      : (this as any).getExecutionId?.() || \`exec-\${Date.now()}\`

    // Auto-register execution ID with API
    try {
      const registerOptions: IHttpRequestOptions = {
        method: "POST",
        url: \`\${baseURL}/api/n8n/register\`,
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
`
}

// =============================================================================
// GENERATE COMPLETE NODE (uses executionId)
// =============================================================================

function generateCompleteNode(workflow: WorkflowDef): string {
  const className = `GenAi${pascalCase(workflow.name)}Complete`
  const displayName = `GenAI: ${pascalCase(workflow.name)} Complete`
  const nodeName = `genAi${pascalCase(workflow.name)}Complete`

  const fields = workflow.resultFields
    .map(
      (field) => `      {
        displayName: "${
          field.name.charAt(0).toUpperCase() + field.name.slice(1)
        }",
        name: "${field.name}",
        type: "${field.type}",
        default: ${getDefaultValue(field.type)},
        required: true,
        description: "Field: ${field.name}",
      },`
    )
    .join("\n")

  const resultAssignments = workflow.resultFields
    .map(
      (f) => `      result["${f.name}"] = this.getNodeParameter("${f.name}", i)`
    )
    .join("\n")

  return `/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: ${workflow.name}
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

export class ${className} implements INodeType {
  description: INodeTypeDescription = {
    displayName: "${displayName}",
    name: "${nodeName}",
    icon: "fa:check-circle",
    group: ["transform"],
    version: 1,
    description: "Complete a ${workflow.name} workflow",
    defaults: {
      name: "${displayName}",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
${fields}
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
${resultAssignments}

      const requestOptions: IHttpRequestOptions = {
        method: "POST",
        url: \`\${baseURL}/api/n8n/${workflow.name}/complete\`,
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
`
}

// =============================================================================
// UPDATE STATUS NODE (uses executionId)
// =============================================================================

const updateStatusNode = `/**
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
        url: \`\${baseURL}/api/n8n/update-status\`,
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
`

// =============================================================================
// MAIN
// =============================================================================

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const workflows = parseWorkflowSchemas()
console.log(
  `📖 Found ${workflows.length} workflow(s): ${workflows
    .map((w) => w.name)
    .join(", ")}`
)

// Generate Update Status node
fs.writeFileSync(
  path.join(OUTPUT_DIR, "GenAiUpdateStatus.node.ts"),
  updateStatusNode
)
console.log(`✅ Generated: GenAiUpdateStatus.node.ts`)

// Generate nodes for each workflow
const nodeFiles: string[] = ["generated/GenAiUpdateStatus.node.js"]

for (const workflow of workflows) {
  // Trigger
  const triggerCode = generateTriggerNode(workflow)
  const triggerFileName = `GenAi${pascalCase(workflow.name)}Trigger.node.ts`
  fs.writeFileSync(path.join(OUTPUT_DIR, triggerFileName), triggerCode)
  console.log(`✅ Generated: ${triggerFileName}`)
  nodeFiles.push(`generated/${triggerFileName.replace(".ts", ".js")}`)

  // Complete
  const completeCode = generateCompleteNode(workflow)
  const completeFileName = `GenAi${pascalCase(workflow.name)}Complete.node.ts`
  fs.writeFileSync(path.join(OUTPUT_DIR, completeFileName), completeCode)
  console.log(
    `✅ Generated: ${completeFileName} (fields: ${workflow.resultFields
      .map((f) => f.name)
      .join(", ")})`
  )
  nodeFiles.push(`generated/${completeFileName.replace(".ts", ".js")}`)
}

// Generate index.ts
const indexContent = `// AUTO-GENERATED - DO NOT EDIT
${workflows
  .map(
    (w) =>
      `export { GenAi${pascalCase(
        w.name
      )}Trigger } from "./nodes/generated/GenAi${pascalCase(
        w.name
      )}Trigger.node"
export { GenAi${pascalCase(
        w.name
      )}Complete } from "./nodes/generated/GenAi${pascalCase(
        w.name
      )}Complete.node"`
  )
  .join("\n")}
export { GenAiUpdateStatus } from "./nodes/generated/GenAiUpdateStatus.node"
`

fs.writeFileSync(path.join(SCRIPT_DIR, "../src/index.ts"), indexContent)
console.log(`✅ Generated: index.ts`)

// Update package.json
const packageJsonPath = path.join(SCRIPT_DIR, "../package.json")
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
packageJson.n8n.nodes = nodeFiles.map((f) => `dist/nodes/${f}`)
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
console.log(`✅ Updated: package.json`)

console.log(`\n🎉 Done! Run 'npm run build' to compile the nodes.`)
