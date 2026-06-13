import express from "express";
import {
  createStatus,
  getStatusList,
  viewStatus,
  deleteStatus,
} from "../controllers/status.controller.js";
import upload from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createStatus);
router.get("/", authMiddleware, getStatusList);
router.put("/:statusId/view", authMiddleware, viewStatus);
router.delete("/:statusId", authMiddleware, deleteStatus);

export default router;
