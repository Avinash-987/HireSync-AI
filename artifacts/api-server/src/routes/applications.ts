import crypto from "crypto";
import { Router } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

const DEMO_JOBS: Record<string, any> = {
  "job_001": { id: "job_001", title: "Frontend Developer", company: "TechCorp Solutions", location: "San Francisco, CA", remoteType: "hybrid", salaryMin: 90000, salaryMax: 130000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://techcorp.example.com/jobs/001", postedAt: new Date(), skills: ["React", "TypeScript"], employmentType: "fulltime", experienceLevel: "junior", isActive: true, description: "Frontend developer role", isSaved: false, hasApplied: false },
  "job_002": { id: "job_002", title: "Full Stack Engineer", company: "Startup Labs", location: "Remote", remoteType: "remote", salaryMin: 100000, salaryMax: 150000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://startuplabs.example.com/jobs/002", postedAt: new Date(), skills: ["React", "Node.js"], employmentType: "fulltime", experienceLevel: "mid", isActive: true, description: "Full stack role", isSaved: false, hasApplied: false },
  "job_003": { id: "job_003", title: "Data Science Intern", company: "DataViz Analytics", location: "New York, NY", remoteType: "hybrid", salaryMin: 40000, salaryMax: 60000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://dataviz.example.com/jobs/003", postedAt: new Date(), skills: ["Python", "ML"], employmentType: "internship", experienceLevel: "fresher", isActive: true, description: "Data science intern", isSaved: false, hasApplied: false },
  "job_004": { id: "job_004", title: "Backend Java Developer", company: "Enterprise Corp", location: "Austin, TX", remoteType: "onsite", salaryMin: 110000, salaryMax: 160000, salaryCurrency: "USD", source: "internal", sourceUrl: "https://enterprise.example.com/jobs/004", postedAt: new Date(), skills: ["Java", "Spring Boot"], employmentType: "fulltime", experienceLevel: "senior", isActive: true, description: "Java developer role", isSaved: false, hasApplied: false },
};

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, req.user!.id));

    const enriched = applications.map(app => ({
      ...app,
      job: DEMO_JOBS[app.jobId] || {
        id: app.jobId,
        title: "Job Position",
        company: "Company",
        location: "Remote",
        remoteType: "remote",
        source: "internal",
        sourceUrl: "#",
        postedAt: new Date(),
        skills: [],
        isActive: true,
        description: "",
        isSaved: false,
        hasApplied: true,
      },
    }));

    return res.json(enriched);
  } catch (error) {
    console.error("Get applications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const { jobId, status = "applied", notes, interviewDate } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });

    const existing = await db.select().from(applicationsTable).where(
      and(eq(applicationsTable.userId, req.user!.id), eq(applicationsTable.jobId, jobId))
    ).limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already tracking this application" });
    }

    const [app] = await db.insert(applicationsTable).values({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      jobId,
      status,
      notes,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
    }).returning();

    return res.status(201).json({
      ...app,
      job: DEMO_JOBS[jobId] || { id: jobId, title: "Job Position", company: "Company", location: "Remote", remoteType: "remote", source: "internal", sourceUrl: "#", postedAt: new Date(), skills: [], isActive: true, description: "", isSaved: false, hasApplied: true },
    });
  } catch (error) {
    console.error("Create application error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const { status, notes, interviewDate } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;

    const [app] = await db.update(applicationsTable).set(updateData).where(
      and(eq(applicationsTable.id, req.params.id), eq(applicationsTable.userId, req.user!.id))
    ).returning();

    if (!app) return res.status(404).json({ message: "Application not found" });

    return res.json({
      ...app,
      job: DEMO_JOBS[app.jobId] || { id: app.jobId, title: "Job Position", company: "Company", location: "Remote", remoteType: "remote", source: "internal", sourceUrl: "#", postedAt: new Date(), skills: [], isActive: true, description: "", isSaved: false, hasApplied: true },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const [deleted] = await db.delete(applicationsTable).where(
      and(eq(applicationsTable.id, req.params.id), eq(applicationsTable.userId, req.user!.id))
    ).returning();

    if (!deleted) return res.status(404).json({ message: "Application not found" });
    return res.json({ message: "Application deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
