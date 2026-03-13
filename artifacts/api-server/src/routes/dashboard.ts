import { Router } from "express";
import { db, applicationsTable, savedJobsTable, alertsTable, notificationsTable, resumesTable, profilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

router.get("/stats", auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const [applications, savedJobs, alerts, notifications, resumes, profile] = await Promise.all([
      db.select().from(applicationsTable).where(eq(applicationsTable.userId, userId)),
      db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, userId)),
      db.select().from(alertsTable).where(eq(alertsTable.userId, userId)),
      db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)),
      db.select().from(resumesTable).where(eq(resumesTable.userId, userId)),
      db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1),
    ]);

    const applicationsByStatus = {
      saved: applications.filter(a => a.status === "saved").length,
      applied: applications.filter(a => a.status === "applied").length,
      assessment: applications.filter(a => a.status === "assessment").length,
      interview: applications.filter(a => a.status === "interview").length,
      rejected: applications.filter(a => a.status === "rejected").length,
      offer: applications.filter(a => a.status === "offer").length,
    };

    const latestResume = resumes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const atsScore = latestResume?.atsScore || 0;

    const unreadNotifications = notifications.filter(n => !n.isRead).length;
    const activeAlerts = alerts.filter(a => a.isActive).length;

    // Calculate profile completion
    const prof = profile[0];
    let profileCompletion = 10;
    if (prof) {
      if (prof.headline) profileCompletion += 15;
      if (prof.bio) profileCompletion += 15;
      if (prof.skills && prof.skills.length > 0) profileCompletion += 15;
      if (prof.experienceLevel) profileCompletion += 10;
      if (prof.preferredRoles && prof.preferredRoles.length > 0) profileCompletion += 10;
      if (prof.github || prof.linkedin) profileCompletion += 10;
      if (prof.phone) profileCompletion += 5;
      if (prof.location) profileCompletion += 5;
    }
    if (resumes.length > 0) profileCompletion = Math.min(profileCompletion + 15, 100);

    const recentActivity = [
      ...applications.slice(-3).map(a => ({
        id: a.id,
        type: "application",
        description: `Application tracked as "${a.status}"`,
        timestamp: a.appliedAt,
      })),
      ...savedJobs.slice(-2).map(s => ({
        id: s.id,
        type: "saved",
        description: "Job bookmarked",
        timestamp: s.savedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    return res.json({
      totalApplications: applications.length,
      savedJobs: savedJobs.length,
      profileCompletion,
      atsScore,
      activeAlerts,
      unreadNotifications,
      applicationsByStatus,
      recentActivity,
      topMatchedRoles: ["Full Stack Developer", "Frontend Developer", "Node.js Developer"],
      skillsInDemand: ["React", "TypeScript", "Node.js", "AWS", "Docker", "Python"],
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
