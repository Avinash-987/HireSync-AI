import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const experienceLevelEnum = pgEnum("experience_level", [
  "fresher",
  "junior",
  "mid",
  "senior",
  "lead",
]);

export const workModeEnum = pgEnum("work_mode", ["remote", "hybrid", "onsite", "any"]);

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  headline: text("headline"),
  bio: text("bio"),
  skills: text("skills").array().notNull().default([]),
  experienceLevel: experienceLevelEnum("experience_level"),
  preferredRoles: text("preferred_roles").array().notNull().default([]),
  preferredLocations: text("preferred_locations").array().notNull().default([]),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  workMode: workModeEnum("work_mode").default("any"),
  github: text("github"),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  phone: text("phone"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
