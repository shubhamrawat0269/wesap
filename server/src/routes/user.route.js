import express from "express";
import {
  sendOtp,
  verifyOtp,
  userLogout,
  getAllUsers,
  updateProfile,
  checkAuthenticated,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/logout", userLogout);

// protected routes
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfile,
);

router.get("/check-auth", authMiddleware, checkAuthenticated);
router.get("/get-users", authMiddleware, getAllUsers);

export default router;
