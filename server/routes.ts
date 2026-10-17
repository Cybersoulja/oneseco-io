import type { Express } from "express";
import { db } from "../db";
import { characters, stories, storyChoices } from "../db/schema";
import { generateStorySegment, generateStoryStart } from "./lib/openai";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Incoming: n8n calls this to send data or trigger something in the app.
  // Set N8N_WEBHOOK_SECRET so only requests carrying that secret are accepted.
  app.post("/api/webhooks/n8n", (req, res) => {
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    if (expectedSecret && req.header("x-n8n-secret") !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Received webhook from n8n:", req.body);
    // TODO: once you know what n8n should trigger, handle req.body here
    // (e.g. update a story, create a character, etc.)
    res.json({ received: true });
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const character = await db.insert(characters).values(req.body).returning();
      res.json(character[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const character = await db.query.characters.findFirst({
        where: eq(characters.id, req.body.characterId)
      });
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      
      const initialStory = await generateStoryStart(character);
      const story = await db.insert(stories).values({
        characterId: req.body.characterId,
        title: "New Adventure",
        currentScene: initialStory.scene,
        context: initialStory.context,
        history: []
      }).returning();
      
      if (initialStory.choices && initialStory.choices.length > 0) {
        await db.insert(storyChoices).values(
          initialStory.choices.map(c => ({
            storyId: story[0].id,
            choiceText: c.text,
            consequence: c.consequence
          }))
        );
      }

      const storyWithChoices = await db.query.stories.findFirst({
        where: eq(stories.id, story[0].id),
        with: {
          character: true,
          choices: true
        }
      });

      res.json(storyWithChoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories/:id/continue", async (req, res) => {
    try {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, req.params.id)
      });
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      const nextSegment = await generateStorySegment(
        story.context as Record<string, unknown>,
        req.body.choice
      );
      
      const updated = await db.update(stories)
        .set({
          currentScene: nextSegment.scene,
          context: nextSegment.context,
          history: [...(story.history as any[]), { scene: story.currentScene, choice: req.body.choice }]
        })
        .where(eq(stories.id, req.params.id))
        .returning();

      await db.delete(storyChoices).where(eq(storyChoices.storyId, story.id));

      if (nextSegment.choices && nextSegment.choices.length > 0) {
        await db.insert(storyChoices).values(
          nextSegment.choices.map(c => ({
            storyId: story.id,
            choiceText: c.text,
            consequence: c.consequence
          }))
        );
      }

      const updatedStoryWithChoices = await db.query.stories.findFirst({
        where: eq(stories.id, updated[0].id),
        with: {
          character: true,
          choices: true
        }
      });
      
      res.json(updatedStoryWithChoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, req.params.id),
        with: {
          character: true,
          choices: true
        }
      });
      res.json(story);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
