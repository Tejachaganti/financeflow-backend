import express from "express";
import { createIncome, getIncome, getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getProfile);
router.put("/", upload.single("avatar"), updateProfile);
router.get("/income", getIncome);
router.post("/income", createIncome);

export default router;
