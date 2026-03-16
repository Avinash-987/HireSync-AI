import crypto from "crypto";
import { Router } from "express";
import { db, resumesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { makeAuthMiddleware, AuthRequest } from "./auth.js";

const router = Router();
const auth = makeAuthMiddleware();

const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "Django", "Flask", "Spring Boot",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Jenkins", "GitHub Actions",
  "Git", "Linux", "Bash", "GraphQL", "REST API", "gRPC",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "scikit-learn",
  "React Native", "Flutter", "iOS", "Android", "Kotlin", "Swift",
  "Tailwind CSS", "CSS", "HTML", "Sass", "Webpack", "Vite",
  "Agile", "Scrum", "JIRA", "Figma", "UI/UX", "Product Management",
  "Cybersecurity", "Network Security", "Penetration Testing", "SIEM",
  "Data Analysis", "SQL", "Tableau", "Power BI", "Spark", "Kafka",
];

function extractSkillsFromText(text: string): string[] {
  const textLower = text.toLowerCase();
  return TECH_SKILLS.filter(skill => textLower.includes(skill.toLowerCase()));
}

function calculateAtsScore(text: string, skills: string[]): number {
  let score = 0;

  // Skills section weight
  score += Math.min(skills.length * 3, 30);

  // Length check (ideal: 400-800 words)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 800) score += 20;
  else if (wordCount >= 200 && wordCount < 400) score += 12;
  else if (wordCount > 800) score += 15;

  // Has contact info
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) score += 10;
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) score += 5;

  // Has sections
  if (/experience|work history|employment/i.test(text)) score += 8;
  if (/education|university|college|degree/i.test(text)) score += 8;
  if (/skills|technologies|tools/i.test(text)) score += 5;
  if (/projects|portfolio/i.test(text)) score += 5;
  if (/certifications|certificates/i.test(text)) score += 4;

  // Summary/objective
  if (/summary|objective|about/i.test(text)) score += 5;

  return Math.min(score, 100);
}

function generateSuggestions(text: string, skills: string[], atsScore: number): string[] {
  const suggestions: string[] = [];

  if (atsScore < 50) suggestions.push("Add more relevant technical skills to your resume");
  if (skills.length < 5) suggestions.push("Include a dedicated Skills section with 8-12 key technologies");
  if (!/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) suggestions.push("Add your phone number for recruiter contact");
  if (!/linkedin/i.test(text)) suggestions.push("Add your LinkedIn profile URL");
  if (!/github/i.test(text)) suggestions.push("Include your GitHub profile to showcase code samples");
  if (!/experience|work history/i.test(text)) suggestions.push("Add a clear Work Experience section with measurable achievements");
  if (!/projects/i.test(text)) suggestions.push("Include personal/academic projects with technologies used");
  if (text.split(/\s+/).length < 300) suggestions.push("Expand your resume content - aim for 400-600 words");
  if (!/\d+%|\d+x|increased|improved|reduced|achieved/i.test(text)) suggestions.push("Quantify your achievements (e.g., 'Improved performance by 40%')");
  if (!/certification|certified/i.test(text)) suggestions.push("Add relevant certifications (AWS, Google Cloud, React, etc.)");

  return suggestions.slice(0, 6);
}

function extractName(text: string): string | null {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.length < 50 && /^[A-Z][a-z]+ [A-Z][a-z]+/.test(firstLine)) {
    return firstLine;
  }
  return null;
}

function extractEmail(text: string): string | null {
  const match = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  return match ? match[0] : null;
}

function detectTargetRole(skills: string[]): string {
  const skillsLower = skills.map(s => s.toLowerCase());

  if (skillsLower.includes("react") && skillsLower.includes("node.js")) return "Full Stack Developer";
  if (skillsLower.includes("react") || skillsLower.includes("vue") || skillsLower.includes("angular")) return "Frontend Developer";
  if (skillsLower.includes("python") && (skillsLower.includes("machine learning") || skillsLower.includes("tensorflow"))) return "ML Engineer";
  if (skillsLower.includes("kubernetes") || skillsLower.includes("docker") || skillsLower.includes("terraform")) return "DevOps Engineer";
  if (skillsLower.includes("java") || skillsLower.includes("spring boot")) return "Backend Developer (Java)";
  if (skillsLower.includes("python") && skillsLower.includes("sql")) return "Data Analyst";
  if (skillsLower.includes("react native") || skillsLower.includes("flutter")) return "Mobile Developer";
  if (skillsLower.includes("aws") || skillsLower.includes("azure") || skillsLower.includes("gcp")) return "Cloud Engineer";

  return "Software Developer";
}

function getMissingSkillsForRole(role: string, userSkills: string[]): string[] {
  const roleSkillMap: Record<string, string[]> = {
    "Full Stack Developer": ["React", "Node.js", "PostgreSQL", "REST API", "Git", "Docker"],
    "Frontend Developer": ["React", "TypeScript", "CSS", "Webpack", "Testing", "Git"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "MLOps"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"],
    "Backend Developer (Java)": ["Java", "Spring Boot", "PostgreSQL", "Docker", "REST API", "Kafka"],
    "Data Analyst": ["SQL", "Python", "Pandas", "Tableau", "Excel", "Statistics"],
    "Mobile Developer": ["React Native", "TypeScript", "Firebase", "REST API", "Git"],
    "Cloud Engineer": ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Security"],
    "Software Developer": ["Git", "Docker", "REST API", "SQL", "Testing", "Linux"],
  };

  const expectedSkills = roleSkillMap[role] || roleSkillMap["Software Developer"];
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  return expectedSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));
}

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, req.user!.id));
    return res.json(resumes);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/upload", auth, async (req: AuthRequest, res) => {
  try {
    const { text, fileName, targetRole } = req.body;

    let parsedText = text || "";

    // If no text provided, simulate with a default for demo
    if (!parsedText) {
      parsedText = `John Doe
john.doe@email.com | 555-123-4567 | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

SUMMARY
Passionate software developer with experience building web applications using modern JavaScript frameworks.

EXPERIENCE
Software Developer Intern - Tech Company (2023-2024)
- Built React components improving user engagement by 25%
- Implemented REST API endpoints using Node.js and Express
- Collaborated with team using Git and Agile methodologies

EDUCATION
Bachelor of Science in Computer Science
State University, 2024 | GPA: 3.7

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, Git, HTML, CSS, Docker, AWS

PROJECTS
Portfolio Website - Built with React and deployed on AWS
Chat Application - Real-time messaging using Node.js and WebSockets`;
    }

    const skills = extractSkillsFromText(parsedText);
    const atsScore = calculateAtsScore(parsedText, skills);
    const detectedRole = targetRole || detectTargetRole(skills);
    const missingSkills = getMissingSkillsForRole(detectedRole, skills);
    const suggestions = generateSuggestions(parsedText, skills, atsScore);

    const [resume] = await db.insert(resumesTable).values({
      id: crypto.randomUUID(),
      userId: req.user!.id,
      fileName: fileName || "resume.pdf",
      parsedText,
      parsedName: extractName(parsedText),
      parsedEmail: extractEmail(parsedText),
      parsedPhone: extractPhone(parsedText),
      skills,
      education: [],
      experience: [],
      projects: [],
      atsScore,
      missingSkills,
      suggestions,
      targetRole: detectedRole,
      isActive: true,
    }).returning();

    return res.status(201).json(resume);
  } catch (error) {
    console.error("Resume upload error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const [resume] = await db.select().from(resumesTable).where(
      and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, req.user!.id))
    ).limit(1);

    if (!resume) return res.status(404).json({ message: "Resume not found" });
    return res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const [deleted] = await db.delete(resumesTable).where(
      and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, req.user!.id))
    ).returning();

    if (!deleted) return res.status(404).json({ message: "Resume not found" });
    return res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
