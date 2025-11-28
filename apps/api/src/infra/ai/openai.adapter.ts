// apps/api/src/infra/ai/openai.adapter.ts
import OpenAI from "openai"
import { AIProvider } from "../../core/ports/ai.provider"
import { env } from "../../env" // Notre validateur Zod

// Initialisation unique du client (Singleton par module)
const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export const openaiAdapter: AIProvider = {
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini", // Modèle rapide/pas cher pour le MVP
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      })

      return response.choices[0].message.content || ""
    } catch (error) {
      console.error("[OpenAI Adapter Error]", error)
      // Ici, on pourrait mapper vers une erreur Domain spécifique
      throw new Error("Erreur de communication avec le service IA")
    }
  },
}
