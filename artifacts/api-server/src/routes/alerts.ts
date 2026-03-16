import crypto from "crypto";
import { Router } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const alerts = await db.select().from(alertsTable).where(eq(alertsTable.userId, req.user!.id));
    return res.json(alerts);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const { keywords, location, remoteOnly, experienceLevel, frequency = "daily", isActive = true } = req.body;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: "Keywords are required" });
    }

    const [alert] = await db.insert(alertsTable).values({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      keywords,
      location,
      remoteOnly: remoteOnly ?? false,
      experienceLevel,
      frequency,
      isActive,
    }).returning();

    return res.status(201).json(alert);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const { keywords, location, remoteOnly, experienceLevel, frequency, isActive } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (keywords !== undefined) updateData.keywords = keywords;
    if (location !== undefined) updateData.location = location;
    if (remoteOnly !== undefined) updateData.remoteOnly = remoteOnly;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [alert] = await db.update(alertsTable).set(updateData).where(
      and(eq(alertsTable.id, req.params.id), eq(alertsTable.userId, req.user!.id))
    ).returning();

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    return res.json(alert);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const [deleted] = await db.delete(alertsTable).where(
      and(eq(alertsTable.id, req.params.id), eq(alertsTable.userId, req.user!.id))
    ).returning();

    if (!deleted) return res.status(404).json({ message: "Alert not found" });
    return res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
