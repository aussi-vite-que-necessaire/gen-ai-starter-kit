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
            displayName: "@ PageGeneration Trigger",
            name: "genAiPageGenerationTrigger",
            icon: "fa:bolt",
            group: ["trigger"],
            version: 1,
            description: "Triggered when a page-generation workflow is started",
            defaults: {
                name: "@ PageGeneration Trigger",
            },
            inputs: [],
            outputs: ["main"],
            webhooks: [
                {
                    name: "default",
                    httpMethod: "POST",
                    path: "page-generation",
                    responseMode: "onReceived",
                    isFullPath: true,
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
        // Store workflowId in static data (accessible by other nodes in this execution)
        const staticData = ((_b = (_a = this).getWorkflowStaticData) === null || _b === void 0 ? void 0 : _b.call(_a, "global")) || {};
        staticData.__genai_workflowId = body.workflowId;
        // Output payload only (workflowId is in staticData)
        return {
            workflowData: [
                [{ json: body.payload }],
            ],
        };
    }
}
exports.GenAiPageGenerationTrigger = GenAiPageGenerationTrigger;
