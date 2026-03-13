import { Router } from "express";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, AuthRequest } from "../lib/auth.js";

const crypto = await import("crypto");
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "hiresync-secret-key-2024";

function generateId(): string {
  return crypto.randomUUID();
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const testHash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return testHash === hash;
}

function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const [header, body, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function makeAuthMiddleware() {
  return async (req: AuthRequest, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    (req as any).user = payload;
    next();
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "seeker" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userId = generateId();
    const hashedPassword = hashPassword(password);

    const [user] = await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "seeker",
      isVerified: false,
    }).returning();

    // Create default profile
    await db.insert(profilesTable).values({
      id: generateId(),
      userId: userId,
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({
      token,
      user: { ...userWithoutPassword, profileCompletion: 10 },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      token,
      user: { ...userWithoutPassword, profileCompletion: 60 },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

router.get("/me", makeAuthMiddleware(), async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ ...userWithoutPassword, profileCompletion: 65 });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export { verifyToken };
export default router;
