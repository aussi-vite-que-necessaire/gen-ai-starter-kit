"use strict";
/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: page-generation
 *
 * Uses n8n execution ID automatically - no workflowId field needed!
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAiPageGenerationComplete = void 0;
class GenAiPageGenerationComplete {
    constructor() {
        this.description = {
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
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
        // Get execution ID from n8n context
        const executionId = this.getExecutionId();
        for (let i = 0; i < items.length; i++) {
            const result = {};
            result["title"] = this.getNodeParameter("title", i);
            result["content"] = this.getNodeParameter("content", i);
            const requestOptions = {
                method: "POST",
                url: `${baseURL}/api/n8n/page-generation/complete`,
                headers: {
                    "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
                    "Content-Type": "application/json",
                },
                body: { executionId, result },
                json: true,
            };
            try {
                const response = await this.helpers.request(requestOptions);
                returnData.push({ json: response });
            }
            catch (error) {
                returnData.push({
                    json: { error: error.message },
                    pairedItem: { item: i },
                });
            }
        }
        return [returnData];
    }
}
exports.GenAiPageGenerationComplete = GenAiPageGenerationComplete;
