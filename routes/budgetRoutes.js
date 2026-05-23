import express from "express";
import { getBudget, getBudgetSnapshot, updateBudget } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getBudget);
router.put("/", updateBudget);
router.get("/snapshot", getBudgetSnapshot);

export default router;
