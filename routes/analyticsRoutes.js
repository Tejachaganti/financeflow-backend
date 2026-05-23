import express from "express";
import { exportExpensesCsv, exportExpensesPdf, getAnalytics, getInsights } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getAnalytics);
router.get("/insights", getInsights);
router.get("/export/csv", exportExpensesCsv);
router.get("/export/pdf", exportExpensesPdf);

export default router;
