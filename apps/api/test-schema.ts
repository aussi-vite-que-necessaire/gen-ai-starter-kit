
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const updateStatusSchema = z.object({
  status: z
    .string()
    .describe("Le statut technique (ex: GENERATING, COMPLETED)"),
  displayMessage: z.string().optional().describe("Message pour l'utilisateur"),
});

const jsonSchema = zodToJsonSchema(updateStatusSchema);
console.log(JSON.stringify(jsonSchema, null, 2));

