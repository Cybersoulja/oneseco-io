import { pgTable, text, integer, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  background: text("background").notNull(),
  traits: jsonb("traits").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  characterId: uuid("character_id").references(() => characters.id),
  title: text("title").notNull(),
  currentScene: text("current_scene").notNull(),
  context: jsonb("context").notNull(),
  history: jsonb("history").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storyChoices = pgTable("story_choices", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").references(() => stories.id),
  choiceText: text("choice_text").notNull(),
  consequence: text("consequence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters);
export const selectCharacterSchema = createSelectSchema(characters);
export const insertStorySchema = createInsertSchema(stories);
export const selectStorySchema = createSelectSchema(stories);
export const insertChoiceSchema = createInsertSchema(storyChoices);
export const selectChoiceSchema = createSelectSchema(storyChoices);

export type Character = z.infer<typeof selectCharacterSchema>;
export type Story = z.infer<typeof selectStorySchema>;
export type StoryChoice = z.infer<typeof selectChoiceSchema>;
