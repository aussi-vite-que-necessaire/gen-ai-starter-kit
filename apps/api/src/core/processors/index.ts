import { updateStatusAction, updateStatusSchema } from "./update-status"
import { testActionHandler, testActionSchema } from "./test-action"

// C'est ici que tu ajouteras tes futures actions (create-page, etc.)
export const ActionRegistry = {
  "update-status": {
    schema: updateStatusSchema,
    handler: updateStatusAction,
  },
  "test-action": {
    schema: testActionSchema,
    handler: testActionHandler,
  },
}

export type ActionName = keyof typeof ActionRegistry
