import crypto from "crypto";
import { Router } from "express";
import { db, profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.user!.id)).limit(1);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/", auth, async (req: AuthRequest, res) => {
  try {
    const { headline, bio, skills, experienceLevel, preferredRoles, preferredLocations,
      salaryMin, salaryMax, workMode, github, linkedin, portfolio, phone, location } = req.body;

    const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.user!.id)).limit(1);

    const updateData: any = { updatedAt: new Date() };
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (preferredRoles !== undefined) updateData.preferredRoles = preferredRoles;
    if (preferredLocations !== undefined) updateData.preferredLocations = preferredLocations;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax;
    if (workMode !== undefined) updateData.workMode = workMode;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;

    if (!existing) {
      const [profile] = await db.insert(profilesTable).values({
        id: crypto.randomUUID(),
        userId: req.user!.id,
        ...updateData,
      }).returning();
      return res.json(profile);
    }

    const [profile] = await db.update(profilesTable).set(updateData).where(eq(profilesTable.userId, req.user!.id)).returning();
    return res.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
