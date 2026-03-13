import { Router } from "express";
import { db, usersTable, resumesTable, alertsTable, applicationsTable, jobsTable } from "@workspace/db";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";
import { sql, eq } from "drizzle-orm";

const router = Router();
const auth = makeAuthMiddleware();

function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

router.get("/stats", auth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [users, resumes, alerts, applications] = await Promise.all([
      db.select().from(usersTable),
      db.select().from(resumesTable),
      db.select().from(alertsTable),
      db.select().from(applicationsTable),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = users.filter(u => new Date(u.createdAt) >= today).length;

    return res.json({
      totalUsers: users.length,
      resumesUploaded: resumes.length,
      totalAlerts: alerts.length,
      jobsFetched: 12, // static demo
      totalApplications: applications.length,
      activeUsers: Math.floor(users.length * 0.7),
      newUsersToday,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", auth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isVerified: usersTable.isVerified,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    return res.json(users.map(u => ({ ...u, profileCompletion: 65 })));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
