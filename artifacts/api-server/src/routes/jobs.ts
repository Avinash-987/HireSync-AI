import crypto from "crypto";
import { Router } from "express";
import { db, jobsTable, profilesTable, resumesTable, savedJobsTable, applicationsTable } from "@workspace/db";
import { eq, like, and, or, sql, ilike } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

const DEMO_JOBS = [
  {
    id: "job_001",
    externalId: "ext_001",
    title: "Frontend Developer",
    company: "TechCorp Solutions",
    companyLogo: null,
    location: "San Francisco, CA",
    remoteType: "hybrid" as const,
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: "USD",
    description: "We are looking for a talented Frontend Developer to join our team. You will work on building and maintaining high-performance React applications, collaborating with designers and backend developers to deliver outstanding user experiences.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Git"],
    source: "internal",
    sourceUrl: "https://techcorp.example.com/jobs/001",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "junior" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_002",
    externalId: "ext_002",
    title: "Full Stack Engineer",
    company: "Startup Labs",
    companyLogo: null,
    location: "Remote",
    remoteType: "remote" as const,
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: "USD",
    description: "Join our fast-growing startup as a Full Stack Engineer! You'll work across the entire stack, from React frontend to Node.js/PostgreSQL backend, helping build products used by millions.",
    skills: ["React", "Node.js", "PostgreSQL", "Docker", "AWS", "TypeScript"],
    source: "internal",
    sourceUrl: "https://startuplabs.example.com/jobs/002",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "mid" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_003",
    externalId: "ext_003",
    title: "Data Science Intern",
    company: "DataViz Analytics",
    companyLogo: null,
    location: "New York, NY",
    remoteType: "hybrid" as const,
    salaryMin: 40000,
    salaryMax: 60000,
    salaryCurrency: "USD",
    description: "Exciting internship opportunity for a passionate Data Science enthusiast. Work with real-world datasets, build ML models, and contribute to data visualization dashboards.",
    skills: ["Python", "Machine Learning", "Pandas", "SQL", "Data Visualization"],
    source: "internal",
    sourceUrl: "https://dataviz.example.com/jobs/003",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    employmentType: "internship" as const,
    experienceLevel: "fresher" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_004",
    externalId: "ext_004",
    title: "Backend Java Developer",
    company: "Enterprise Corp",
    companyLogo: null,
    location: "Austin, TX",
    remoteType: "onsite" as const,
    salaryMin: 110000,
    salaryMax: 160000,
    salaryCurrency: "USD",
    description: "We need an experienced Java developer to build scalable microservices. Experience with Spring Boot, Kafka, and cloud platforms preferred.",
    skills: ["Java", "Spring Boot", "Kafka", "AWS", "PostgreSQL", "Docker"],
    source: "internal",
    sourceUrl: "https://enterprise.example.com/jobs/004",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "senior" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_005",
    externalId: "ext_005",
    title: "React Native Mobile Developer",
    company: "MobileFirst Inc",
    companyLogo: null,
    location: "Remote",
    remoteType: "remote" as const,
    salaryMin: 95000,
    salaryMax: 135000,
    salaryCurrency: "USD",
    description: "Build cross-platform mobile applications using React Native. You'll work on consumer-facing apps with millions of users, focusing on performance and great UX.",
    skills: ["React Native", "TypeScript", "Redux", "iOS", "Android", "Firebase"],
    source: "internal",
    sourceUrl: "https://mobilefirst.example.com/jobs/005",
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "mid" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_006",
    externalId: "ext_006",
    title: "DevOps Engineer",
    company: "CloudScale Systems",
    companyLogo: null,
    location: "Seattle, WA",
    remoteType: "hybrid" as const,
    salaryMin: 120000,
    salaryMax: 170000,
    salaryCurrency: "USD",
    description: "Lead DevOps transformation initiatives. Setup CI/CD pipelines, manage Kubernetes clusters, and ensure system reliability with 99.9% uptime SLAs.",
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux", "Python"],
    source: "internal",
    sourceUrl: "https://cloudscale.example.com/jobs/006",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "senior" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_007",
    externalId: "ext_007",
    title: "UI/UX Designer",
    company: "DesignStudio Pro",
    companyLogo: null,
    location: "Los Angeles, CA",
    remoteType: "remote" as const,
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: "USD",
    description: "Design beautiful, intuitive interfaces for our SaaS products. Create wireframes, prototypes, and high-fidelity designs using Figma.",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping", "CSS", "Adobe XD"],
    source: "internal",
    sourceUrl: "https://designstudio.example.com/jobs/007",
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "junior" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_008",
    externalId: "ext_008",
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    companyLogo: null,
    location: "Boston, MA",
    remoteType: "hybrid" as const,
    salaryMin: 130000,
    salaryMax: 200000,
    salaryCurrency: "USD",
    description: "Build and deploy machine learning models at scale. Work on NLP, computer vision, and recommendation systems powering our flagship products.",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS SageMaker", "SQL"],
    source: "internal",
    sourceUrl: "https://aiinnovations.example.com/jobs/008",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "senior" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_009",
    externalId: "ext_009",
    title: "Junior Web Developer",
    company: "WebWave Agency",
    companyLogo: null,
    location: "Chicago, IL",
    remoteType: "onsite" as const,
    salaryMin: 55000,
    salaryMax: 75000,
    salaryCurrency: "USD",
    description: "Perfect opportunity for fresh graduates. Build responsive websites for clients across various industries. Mentorship provided. Great for building your portfolio.",
    skills: ["HTML", "CSS", "JavaScript", "React", "Git", "WordPress"],
    source: "internal",
    sourceUrl: "https://webwave.example.com/jobs/009",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "fresher" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_010",
    externalId: "ext_010",
    title: "Product Manager",
    company: "SaaS Builder",
    companyLogo: null,
    location: "Remote",
    remoteType: "remote" as const,
    salaryMin: 120000,
    salaryMax: 165000,
    salaryCurrency: "USD",
    description: "Drive product vision and strategy for our growing B2B SaaS platform. Work closely with engineering, design, and customers to deliver impactful features.",
    skills: ["Product Strategy", "Agile", "JIRA", "Analytics", "SQL", "User Research"],
    source: "internal",
    sourceUrl: "https://saasbuilder.example.com/jobs/010",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "mid" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_011",
    externalId: "ext_011",
    title: "Cybersecurity Analyst",
    company: "SecureNet",
    companyLogo: null,
    location: "Washington, DC",
    remoteType: "hybrid" as const,
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: "USD",
    description: "Protect our infrastructure from threats. Perform security audits, penetration testing, and incident response. CISSP or CEH certification preferred.",
    skills: ["Cybersecurity", "Penetration Testing", "SIEM", "Linux", "Network Security", "Python"],
    source: "internal",
    sourceUrl: "https://securenet.example.com/jobs/011",
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "mid" as const,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "job_012",
    externalId: "ext_012",
    title: "Cloud Solutions Architect",
    company: "Nimbus Technologies",
    companyLogo: null,
    location: "Denver, CO",
    remoteType: "remote" as const,
    salaryMin: 150000,
    salaryMax: 220000,
    salaryCurrency: "USD",
    description: "Design and implement cloud architectures for enterprise clients. Lead technical discovery, create architecture diagrams, and guide teams through cloud migrations.",
    skills: ["AWS", "Azure", "GCP", "Terraform", "Architecture", "Security"],
    source: "internal",
    sourceUrl: "https://nimbus.example.com/jobs/012",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    employmentType: "fulltime" as const,
    experienceLevel: "lead" as const,
    isActive: true,
    createdAt: new Date(),
  },
];

async function seedJobsIfEmpty() {
  const existingJobs = await db.select().from(jobsTable).limit(1);
  if (existingJobs.length === 0) {
    await db.insert(jobsTable).values(DEMO_JOBS);
  }
}

seedJobsIfEmpty().catch(console.error);

function calculateMatchScore(jobSkills: string[], userSkills: string[]): { score: number; matched: string[]; missing: string[] } {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matched = jobSkills.filter(s => userSkillsLower.includes(s.toLowerCase()));
  const missing = jobSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));
  const score = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  return { score, matched, missing };
}

function getMatchReasons(job: any, profile: any, score: number): string[] {
  const reasons: string[] = [];
  if (score >= 75) reasons.push("Strong skills match with job requirements");
  if (score >= 50 && score < 75) reasons.push("Good skills overlap with job requirements");
  if (profile?.workMode === job.remoteType || profile?.workMode === "any") reasons.push("Matches your work preference");
  if (profile?.preferredLocations?.includes(job.location)) reasons.push("Located in your preferred area");
  if (profile?.experienceLevel === job.experienceLevel || job.experienceLevel === "any") reasons.push("Matches your experience level");
  if (reasons.length === 0) reasons.push("Related to your profile");
  return reasons;
}

router.get("/search", auth, async (req: AuthRequest, res) => {
  try {
    const { query, location, remote, experience, page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const offset = (pageNum - 1) * limitNum;

    let jobs = DEMO_JOBS.filter(j => j.isActive);

    if (query) {
      const q = query.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    if (location) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (remote) {
      jobs = jobs.filter(j => j.remoteType === remote);
    }
    if (experience) {
      jobs = jobs.filter(j => j.experienceLevel === experience || j.experienceLevel === "any");
    }

    const total = jobs.length;
    const paginatedJobs = jobs.slice(offset, offset + limitNum);

    const savedJobIds = new Set<string>();
    const appliedJobIds = new Set<string>();

    if (req.user) {
      const saved = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, req.user.id));
      const applied = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, req.user.id));
      saved.forEach(s => savedJobIds.add(s.jobId));
      applied.forEach(a => appliedJobIds.add(a.jobId));
    }

    return res.json({
      jobs: paginatedJobs.map(j => ({
        ...j,
        isSaved: savedJobIds.has(j.id),
        hasApplied: appliedJobIds.has(j.id),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Job search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/recommended", auth, async (req: AuthRequest, res) => {
  try {
    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.user!.id)).limit(1);
    const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, req.user!.id));

    const userSkills = [
      ...(profile?.skills || []),
      ...(resumes.flatMap(r => r.skills) || []),
    ];

    const uniqueSkills = [...new Set(userSkills)];

    const savedJobIds = new Set<string>();
    const appliedJobIds = new Set<string>();

    const saved = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, req.user!.id));
    const applied = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, req.user!.id));
    saved.forEach(s => savedJobIds.add(s.jobId));
    applied.forEach(a => appliedJobIds.add(a.jobId));

    const recommendedJobs = DEMO_JOBS
      .filter(j => j.isActive)
      .map(job => {
        const { score, matched, missing } = calculateMatchScore(job.skills, uniqueSkills.length > 0 ? uniqueSkills : ["JavaScript", "React"]);
        const matchReasons = getMatchReasons(job, profile, score);
        return {
          ...job,
          matchScore: score,
          matchedSkills: matched,
          missingSkills: missing,
          matchReasons,
          isSaved: savedJobIds.has(job.id),
          hasApplied: appliedJobIds.has(job.id),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json(recommendedJobs);
  } catch (error) {
    console.error("Recommended jobs error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/trending", async (req, res) => {
  return res.json({
    trendingSkills: [
      { skill: "React", demand: 95, growth: 12.5 },
      { skill: "TypeScript", demand: 88, growth: 18.2 },
      { skill: "Python", demand: 92, growth: 8.7 },
      { skill: "Node.js", demand: 85, growth: 10.1 },
      { skill: "Kubernetes", demand: 78, growth: 22.3 },
      { skill: "AWS", demand: 90, growth: 15.6 },
      { skill: "Machine Learning", demand: 82, growth: 25.1 },
      { skill: "GraphQL", demand: 72, growth: 19.8 },
    ],
    trendingRoles: ["Full Stack Developer", "ML Engineer", "DevOps Engineer", "Cloud Architect", "Data Scientist"],
    hotCompanies: ["TechCorp", "Startup Labs", "AI Innovations", "CloudScale", "DataViz"],
  });
});

router.get("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const job = DEMO_JOBS.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const savedJobIds = new Set<string>();
    const appliedJobIds = new Set<string>();

    const saved = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, req.user!.id));
    const applied = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, req.user!.id));
    saved.forEach(s => savedJobIds.add(s.jobId));
    applied.forEach(a => appliedJobIds.add(a.jobId));

    return res.json({
      ...job,
      isSaved: savedJobIds.has(job.id),
      hasApplied: appliedJobIds.has(job.id),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
