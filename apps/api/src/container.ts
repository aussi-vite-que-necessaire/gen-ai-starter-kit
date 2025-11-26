// Ce fichier est le SEUL endroit où on assemble les briques
import { openaiAdapter } from "./infra/ai/openai.adapter"
import { generationAdapter } from "./infra/db/generation.adapter"
import { makeGenerateSummary } from "./core/use-cases/generate-summary"
import { makeListHistory } from "./core/use-cases/list-history"
import { makeDeleteGeneration } from "./core/use-cases/delete-generation"

// On exporte des instances prêtes à l'emploi
export const useCases = {
  generateSummary: makeGenerateSummary(openaiAdapter, generationAdapter),
  listHistory: makeListHistory(generationAdapter),
  deleteGeneration: makeDeleteGeneration(generationAdapter),
}
