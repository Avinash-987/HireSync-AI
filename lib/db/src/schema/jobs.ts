import { pgTable, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const remoteTypeEnum = pgEnum("remote_type", ["remote", "hybrid", "onsite"]);
export const employmentTypeEnum = pgEnum("employment_type", [
  "fulltime",
  "parttime",
  "contract",
  "internship",
  "freelance",
]);
export const jobExperienceLevelEnum = pgEnum("job_experience_level", [
  "fresher",
  "junior",
  "mid",
  "senior",
  "lead",
  "any",
]);

export const jobsTable = pgTable("jobs", {
  id: text("id").primaryKey(),
  externalId: text("external_id"),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  location: text("location").notNull(),
  remoteType: remoteTypeEnum("remote_type").default("onsite"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("USD"),
  description: text("description").notNull(),
  skills: text("skills").array().notNull().default([]),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
  employmentType: employmentTypeEnum("employment_type").default("fulltime"),
  experienceLevel: jobExperienceLevelEnum("experience_level").default("any"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
