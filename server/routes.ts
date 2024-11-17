import type { Express } from "express";
import { db } from "../db";
import { characters, stories, storyChoices } from "../db/schema";
import { generateStorySegment, generateStoryStart } from "./lib/openai";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  app.post("/api/characters", async (req, res) => {
    try {
      const character = await db.insert(characters).values(req.body).returning();
      res.json(character[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const character = await db.query.characters.findFirst({
        where: eq(characters.id, req.body.characterId)
      });
      
      const initialStory = await generateStoryStart(character);
      const story = await db.insert(stories).values({
        characterId: req.body.characterId,
        title: "New Adventure",
        currentScene: initialStory.scene,
        context: initialStory.context,
        history: []
      }).returning();
      
      res.json(story[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stories/:id/continue", async (req, res) => {
    try {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, req.params.id)
      });
      
      const nextSegment = await generateStorySegment(
        story.context,
        req.body.choice
      );
      
      const updated = await db.update(stories)
        .set({
          currentScene: nextSegment.scene,
          context: nextSegment.context,
          history: [...story.history, { scene: story.currentScene, choice: req.body.choice }]
        })
        .where(eq(stories.id, req.params.id))
        .returning();
      
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, req.params.id),
        with: {
          character: true
        }
      });
      res.json(story);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
