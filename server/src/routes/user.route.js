import express from "express";
import {
  sendOtp,
  verifyOtp,
  updateProfile,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfile,
);

export default router;
