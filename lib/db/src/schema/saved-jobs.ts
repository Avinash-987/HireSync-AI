import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedJobsTable = pgTable("saved_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobId: text("job_id").notNull(),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

export const insertSavedJobSchema = createInsertSchema(savedJobsTable).omit({
  id: true,
  savedAt: true,
});

export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type SavedJob = typeof savedJobsTable.$inferSelect;
