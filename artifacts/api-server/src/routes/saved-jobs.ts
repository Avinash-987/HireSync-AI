import { Router } from "express";
import { db, savedJobsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const crypto = await import("crypto");
const router = Router();
const auth = makeAuthMiddleware();

const DEMO_JOBS: Record<string, any> = {
  "job_001": { id: "job_001", title: "Frontend Developer", company: "TechCorp Solutions", location: "San Francisco, CA", remoteType: "hybrid", salaryMin: 90000, salaryMax: 130000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://techcorp.example.com/jobs/001", postedAt: new Date(Date.now() - 2 * 86400000), skills: ["React", "TypeScript", "Tailwind CSS"], employmentType: "fulltime", experienceLevel: "junior", isActive: true, description: "Frontend developer role" },
  "job_002": { id: "job_002", title: "Full Stack Engineer", company: "Startup Labs", location: "Remote", remoteType: "remote", salaryMin: 100000, salaryMax: 150000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://startuplabs.example.com/jobs/002", postedAt: new Date(Date.now() - 86400000), skills: ["React", "Node.js", "PostgreSQL"], employmentType: "fulltime", experienceLevel: "mid", isActive: true, description: "Full stack role" },
  "job_005": { id: "job_005", title: "React Native Mobile Developer", company: "MobileFirst Inc", location: "Remote", remoteType: "remote", salaryMin: 95000, salaryMax: 135000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://mobilefirst.example.com/jobs/005", postedAt: new Date(Date.now() - 4 * 86400000), skills: ["React Native", "TypeScript", "Redux"], employmentType: "fulltime", experienceLevel: "mid", isActive: true, description: "Mobile developer role" },
};

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const savedJobs = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, req.user!.id));

    const enriched = savedJobs.map(sj => ({
      ...sj,
      job: DEMO_JOBS[sj.jobId] || {
        id: sj.jobId, title: "Job Position", company: "Company", location: "Remote",
        remoteType: "remote", source: "internal", sourceUrl: "#", postedAt: new Date(),
        skills: [], isActive: true, description: "", isSaved: true, hasApplied: false,
      },
    }));

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });

    const existing = await db.select().from(savedJobsTable).where(
      and(eq(savedJobsTable.userId, req.user!.id), eq(savedJobsTable.jobId, jobId))
    ).limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const [savedJob] = await db.insert(savedJobsTable).values({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      jobId,
    }).returning();

    return res.status(201).json({
      ...savedJob,
      job: DEMO_JOBS[jobId] || { id: jobId, title: "Job Position", company: "Company", location: "Remote", remoteType: "remote", source: "internal", sourceUrl: "#", postedAt: new Date(), skills: [], isActive: true, description: "" },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const [deleted] = await db.delete(savedJobsTable).where(
      and(eq(savedJobsTable.id, req.params.id), eq(savedJobsTable.userId, req.user!.id))
    ).returning();

    if (!deleted) return res.status(404).json({ message: "Saved job not found" });
    return res.json({ message: "Job removed from saved" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
