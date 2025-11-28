import { z } from "zod"

export const testActionSchema = z.object({
  title: z.string().describe("The title of the post"),
  content: z.string().describe("The content of the post"),
  published: z.boolean().default(false).describe("Is it published?"),
  tags: z.array(z.string()).describe("Tags for the post"),
})

export const testActionHandler = async (generationId: string, input: any) => {
  console.log("Test action executed", input)
  return { success: true, ...input }
}

