import { pgTable, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resumesTable = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  parsedText: text("parsed_text"),
  parsedName: text("parsed_name"),
  parsedEmail: text("parsed_email"),
  parsedPhone: text("parsed_phone"),
  skills: text("skills").array().notNull().default([]),
  education: jsonb("education").default([]),
  experience: jsonb("experience").default([]),
  projects: jsonb("projects").default([]),
  atsScore: integer("ats_score").notNull().default(0),
  missingSkills: text("missing_skills").array().notNull().default([]),
  suggestions: text("suggestions").array().notNull().default([]),
  targetRole: text("target_role"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumesTable.$inferSelect;
