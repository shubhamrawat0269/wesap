import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
} from "../controllers/message.controller.js";
import upload from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/send-message",
  authMiddleware,
  upload.single("profilePicture"),
  sendMessage,
);
router.get("/conversations", authMiddleware, getConversations);
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getMessages,
);

router.put("/message/read", authMiddleware, markAsRead);
router.get("/messages/:messageId", authMiddleware, markAsRead);

export default router;
