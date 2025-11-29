"use strict";
/**
 * AUTO-GENERATED - DO NOT EDIT
 * Workflow: page-generation
 *
 * This trigger automatically registers the n8n execution ID with the API.
 * All subsequent nodes can use $execution.id to identify the workflow.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAiPageGenerationTrigger = void 0;
class GenAiPageGenerationTrigger {
    constructor() {
        this.description = {
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
        };
    }
    async webhook() {
        var _a, _b;
        const req = this.getRequestObject();
        const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
        // Validate internal secret
        const secret = req.headers["x-internal-secret"];
        const expectedSecret = process.env.INTERNAL_API_SECRET;
        if (!expectedSecret || secret !== expectedSecret) {
            return { webhookResponse: { error: "Unauthorized" } };
        }
        const body = this.getBodyData();
        // Get n8n execution ID
        const executionId = this.getMode() === "manual"
            ? `manual-${Date.now()}`
            : ((_b = (_a = this).getExecutionId) === null || _b === void 0 ? void 0 : _b.call(_a)) || `exec-${Date.now()}`;
        // Auto-register execution ID with API
        try {
            const registerOptions = {
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
            };
            await this.helpers.request(registerOptions);
        }
        catch (error) {
            console.error("Failed to register execution:", error);
        }
        // Output payload (no workflowId needed - use $execution.id)
        return {
            workflowData: [
                [{ json: body.payload }],
            ],
        };
    }
}
exports.GenAiPageGenerationTrigger = GenAiPageGenerationTrigger;
