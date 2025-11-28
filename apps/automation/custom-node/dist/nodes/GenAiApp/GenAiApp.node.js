"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenAiApp = void 0;
class GenAiApp {
    constructor() {
        this.description = {
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
        };
        this.methods = {
            loadOptions: {
                async getActions() {
                    // Utilisation du helper natif n8n pour la requête HTTP
                    // Note: Dans Docker, host.docker.internal est souvent nécessaire,
                    // mais on peut aussi passer par l'env var définie dans docker-compose
                    const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
                    const options = {
                        method: "GET",
                        url: `${baseURL}/api/internal/actions`,
                        headers: {
                            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
                            "Content-Type": "application/json",
                        },
                        json: true,
                    };
                    try {
                        const response = await this.helpers.request(options);
                        return (response || []).map((action) => ({
                            name: action.name,
                            value: action.slug,
                        }));
                    }
                    catch (error) {
                        console.error("Error loading actions:", error);
                        return [];
                    }
                },
            },
            resourceMapping: {
                async getMappingFields() {
                    const actionSlug = this.getNodeParameter("actionSlug");
                    const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
                    console.log(`🚀 [GenAI Node] Loading fields for ${actionSlug} via ${baseURL}`);
                    const options = {
                        method: "GET",
                        url: `${baseURL}/api/internal/actions`,
                        headers: {
                            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
                            "Content-Type": "application/json",
                        },
                        json: true,
                    };
                    try {
                        const response = await this.helpers.request(options);
                        const actions = Array.isArray(response) ? response : [];
                        const selectedAction = actions.find((a) => a.slug === actionSlug);
                        if (!selectedAction ||
                            !selectedAction.schema ||
                            !selectedAction.schema.properties) {
                            throw new Error(`Schema not found for action: ${actionSlug}`);
                        }
                        const properties = selectedAction.schema.properties;
                        const fields = Object.keys(properties).map((key) => {
                            var _a, _b;
                            const prop = properties[key];
                            return {
                                id: key,
                                displayName: key.charAt(0).toUpperCase() + key.slice(1),
                                required: ((_a = selectedAction.schema.required) === null || _a === void 0 ? void 0 : _a.includes(key)) || false,
                                defaultMatch: false,
                                display: true,
                                type: "string",
                                options: (_b = prop.enum) === null || _b === void 0 ? void 0 : _b.map((v) => ({ name: v, value: v })),
                            };
                        });
                        return { fields };
                    }
                    catch (error) {
                        console.error("Error fetching fields:", error);
                        throw new Error(`Failed to fetch fields: ${error.message}`);
                    }
                },
            },
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const secret = process.env.INTERNAL_API_SECRET;
        const baseURL = process.env.GENAI_API_URL || "http://host.docker.internal:3000";
        for (let i = 0; i < items.length; i++) {
            try {
                const runId = this.getNodeParameter("runId", i);
                const actionSlug = this.getNodeParameter("actionSlug", i);
                // Récupération propre du Resource Mapper
                const mappedData = this.getNodeParameter("fields", i);
                const payload = mappedData.value || {};
                const options = {
                    method: "POST",
                    url: `${baseURL}/api/internal/runs/${runId}/execute`,
                    body: { action: actionSlug, payload },
                    headers: {
                        "x-internal-secret": secret || "",
                        "Content-Type": "application/json",
                    },
                    json: true,
                };
                const response = await this.helpers.request(options);
                returnData.push({ json: response });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                }
                else {
                    throw error;
                }
            }
        }
        return [returnData];
    }
}
exports.GenAiApp = GenAiApp;
