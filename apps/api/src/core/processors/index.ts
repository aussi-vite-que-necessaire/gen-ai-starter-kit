import { updateStatusAction, updateStatusSchema } from "./update-status"

// C'est ici que tu ajouteras tes futures actions (create-page, etc.)
export const ActionRegistry = {
  "update-status": {
    schema: updateStatusSchema,
    handler: updateStatusAction,
  },
}

export type ActionName = keyof typeof ActionRegistry
