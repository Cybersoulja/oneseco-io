import { z } from "zod";

// Response schema for story generation
export const StoryResponseSchema = z.object({
  scene: z.string(),
  mood: z.string(),
  choices: z.array(z.object({
    text: z.string(),
    consequence: z.string()
  })),
  context: z.record(z.unknown())
});

export type StoryResponse = z.infer<typeof StoryResponseSchema>;

export type StoryContext = {
  character: {
    name: string;
    background: string;
    traits: Record<string, unknown>;
  };
  currentScene: string;
  mood: string;
  previousChoices: string[];
  worldState: Record<string, unknown>;
};

// Helper function to generate story context string
function generateContextString(context: StoryContext): string {
  return `
Character: ${context.character.name}
Background: ${context.character.background}
Traits: ${JSON.stringify(context.character.traits)}
Current Scene: ${context.currentScene}
Mood: ${context.mood}
Previous Choices: ${context.previousChoices.join(", ")}
World State: ${JSON.stringify(context.worldState)}
  `.trim();
}

// Main story generation function
export async function generateStorySegment(
  context: StoryContext,
  choice?: string
): Promise<StoryResponse> {
  try {
    const response = await fetch("/api/stories/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context,
        choice,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate story segment");
    }

    const data = await response.json();
    return StoryResponseSchema.parse(data);
  } catch (error) {
    console.error("Story generation error:", error);
    throw error;
  }
}

// Initial story setup function
export async function initializeStory(
  character: StoryContext["character"]
): Promise<StoryResponse> {
  const initialContext: StoryContext = {
    character,
    currentScene: "",
    mood: "neutral",
    previousChoices: [],
    worldState: {
      timeOfDay: "dawn",
      location: "starting_village",
      questProgress: 0,
    },
  };

  try {
    const response = await fetch("/api/stories/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(initialContext),
    });

    if (!response.ok) {
      throw new Error("Failed to initialize story");
    }

    const data = await response.json();
    return StoryResponseSchema.parse(data);
  } catch (error) {
    console.error("Story initialization error:", error);
    throw error;
  }
}

// Utility function to update context based on story progression
export function updateStoryContext(
  currentContext: StoryContext,
  storyResponse: StoryResponse,
  choice?: string
): StoryContext {
  return {
    ...currentContext,
    currentScene: storyResponse.scene,
    mood: storyResponse.mood,
    previousChoices: choice 
      ? [...currentContext.previousChoices, choice]
      : currentContext.previousChoices,
    worldState: {
      ...currentContext.worldState,
      ...storyResponse.context,
    },
  };
}

// Function to generate story choices based on context
export async function generateChoices(
  context: StoryContext
): Promise<Array<{ text: string; consequence: string }>> {
  try {
    const response = await fetch("/api/stories/choices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: generateContextString(context),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate choices");
    }

    const data = await response.json();
    return z.array(z.object({
      text: z.string(),
      consequence: z.string(),
    })).parse(data);
  } catch (error) {
    console.error("Choice generation error:", error);
    throw error;
  }
}

// Helper function to sanitize and validate story text
export function sanitizeStoryText(text: string): string {
  // Remove any HTML tags that might have been generated
  const sanitized = text.replace(/<[^>]*>/g, "");
  
  // Ensure the text ends with proper punctuation
  if (!sanitized.match(/[.!?]$/)) {
    return sanitized + ".";
  }
  
  return sanitized;
}

// Function to generate story title based on context
export async function generateStoryTitle(
  context: StoryContext
): Promise<string> {
  try {
    const response = await fetch("/api/stories/title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        character: context.character,
        worldState: context.worldState,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate story title");
    }

    const data = await response.json();
    return z.string().parse(data.title);
  } catch (error) {
    console.error("Title generation error:", error);
    throw error;
  }
}

// Export the complete story generator API
export const StoryGenerator = {
  initialize: initializeStory,
  generateSegment: generateStorySegment,
  updateContext: updateStoryContext,
  generateChoices,
  generateTitle: generateStoryTitle,
  sanitizeText: sanitizeStoryText,
};
