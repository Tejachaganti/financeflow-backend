import express from "express";
import { createExpense, deleteExpense, getExpenseById, getExpenses, updateExpense } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getExpenses).post(upload.single("receipt"), createExpense);
router.route("/:id").get(getExpenseById).put(upload.single("receipt"), updateExpense).delete(deleteExpense);

export default router;
