import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import resumeRouter from "./resume.js";
import jobsRouter from "./jobs.js";
import applicationsRouter from "./applications.js";
import savedJobsRouter from "./saved-jobs.js";
import alertsRouter from "./alerts.js";
import notificationsRouter from "./notifications.js";
import dashboardRouter from "./dashboard.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/resume", resumeRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/saved-jobs", savedJobsRouter);
router.use("/alerts", alertsRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);

export default router;
