"use strict";
/**
 * AUTO-GENERATED - DO NOT EDIT
 *
 * Uses workflowId from staticData (stored by Trigger)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAiUpdateStatus = void 0;
class GenAiUpdateStatus {
    constructor() {
        this.description = {
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
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
        // Get workflowId from static data (stored by Trigger)
        const staticData = this.getWorkflowStaticData("global");
        const workflowId = staticData.__genai_workflowId;
        if (!workflowId) {
            throw new Error("workflowId not found in staticData. Make sure the GenAI Trigger is used.");
        }
        for (let i = 0; i < items.length; i++) {
            const displayMessage = this.getNodeParameter("displayMessage", i);
            const requestOptions = {
                method: "POST",
                url: `${baseURL}/api/n8n/update-status`,
                headers: {
                    "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
                    "Content-Type": "application/json",
                },
                body: { workflowId, displayMessage },
                json: true,
            };
            try {
                const response = await this.helpers.request(requestOptions);
                returnData.push({ json: { ...items[i].json, ...response } });
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
exports.GenAiUpdateStatus = GenAiUpdateStatus;
