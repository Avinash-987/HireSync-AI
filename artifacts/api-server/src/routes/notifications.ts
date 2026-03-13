import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const crypto = await import("crypto");
const router = Router();
const auth = makeAuthMiddleware();

async function seedNotificationsIfEmpty(userId: string) {
  const existing = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(notificationsTable).values([
      {
        id: crypto.randomUUID(),
        userId,
        title: "Welcome to HireSync AI!",
        message: "Your AI-powered job search journey begins. Upload your resume to get personalized job recommendations.",
        type: "system" as const,
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: crypto.randomUUID(),
        userId,
        title: "5 New Job Matches Found",
        message: "Based on your profile, we found 5 new jobs matching your skills in React and TypeScript.",
        type: "job_match" as const,
        isRead: false,
        jobId: "job_001",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: crypto.randomUUID(),
        userId,
        title: "Resume Analysis Complete",
        message: "Your resume scored 72/100 on ATS. We have suggestions to improve your score to 90+.",
        type: "resume_score" as const,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]);
  }
}

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    await seedNotificationsIfEmpty(req.user!.id);
    const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, req.user!.id));
    return res.json(notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/read-all", auth, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, req.user!.id));
    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id/read", auth, async (req: AuthRequest, res) => {
  try {
    const [notification] = await db.update(notificationsTable).set({ isRead: true }).where(
      and(eq(notificationsTable.id, req.params.id), eq(notificationsTable.userId, req.user!.id))
    ).returning();

    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
