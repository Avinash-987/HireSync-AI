import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertFrequencyEnum = pgEnum("alert_frequency", [
  "instant",
  "daily",
  "weekly",
]);

export const alertsTable = pgTable("alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  location: text("location"),
  remoteOnly: boolean("remote_only").notNull().default(false),
  experienceLevel: text("experience_level"),
  frequency: alertFrequencyEnum("frequency").notNull().default("daily"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
