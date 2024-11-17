import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const StoryResponseSchema = z.object({
  scene: z.string(),
  mood: z.string(),
  choices: z.array(z.object({
    text: z.string(),
    consequence: z.string()
  })),
  context: z.record(z.unknown())
});

export async function generateStorySegment(
  context: Record<string, unknown>,
  prompt: string
): Promise<z.infer<typeof StoryResponseSchema>> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a fantasy storyteller creating interactive narratives. Generate engaging story segments with meaningful choices."
      },
      {
        role: "user",
        content: JSON.stringify({ context, prompt })
      }
    ],
    response_format: { type: "json_object" }
  });

  const parsed = StoryResponseSchema.parse(JSON.parse(response.choices[0].message.content));
  return parsed;
}

export async function generateStoryStart(
  character: { name: string; background: string; traits: Record<string, unknown> }
): Promise<z.infer<typeof StoryResponseSchema>> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Create an engaging opening scene for a new fantasy story based on the character details provided."
      },
      {
        role: "user",
        content: JSON.stringify(character)
      }
    ],
    response_format: { type: "json_object" }
  });

  const parsed = StoryResponseSchema.parse(JSON.parse(response.choices[0].message.content));
  return parsed;
}
