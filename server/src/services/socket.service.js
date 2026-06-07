import { Server } from "socket.io";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// creating a map to store online users
const onlineUsers = new Map();
const typingUsers = new Map();

const initiazeSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_LOCAL_URL,
      credentials: true,
      methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`User Connected ${socket.id}`);
    let userId = null;

    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        // update in db
        await User.findByIdAndUpdate({
          isOnline: true,
          lastSeen: new Date(),
        });

        // notify all users that this is online
        io.emit("user_status", { userId, isOnline: true });
      } catch (error) {
        console.error(`Error handling user connection: ${error.message}`);
      }
    });

    socket.on("get_user_status", (requestedUserId, callback) => {
      const isOnline = onlineUsers.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: isOnline ? new Date() : null,
      });
    });

    socket.on("send_message", async (message) => {
      try {
        const recievedSocketId = onlineUsers.get(message.reciever?._id);
        if (recievedSocketId) {
          io.to(recievedSocketId).emit("recieve_message", message);
        }
      } catch (error) {
        console.error("Failed to send Message");
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    socket.on("message_read", async ({ messageIds, senderId }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } },
        );

        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          messageIds.forEach((messageId) => {
            io.to(senderSocketId).emit("message_status_update", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.error("Failed to update Message");
      }
    });
  });
};
