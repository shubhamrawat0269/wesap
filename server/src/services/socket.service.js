import { Server } from "socket.io";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// creating a map to store online users
const onlineUsers = new Map();
const typingUsers = new Map();

export const initiazeSockets = (server) => {
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

    socket.on("typing_start", ({ convsersationId, recieverId }) => {
      if (!userId || !convsersationId || !recieverId) return;

      if (!typingUsers.has(userId)) typingUsers.set(userId, {});
      const userTyping = typingUsers.get(userId);

      userTyping[convsersationId] = true;

      // clear any exisiting timeout
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
      }

      // autostop after 3sec
      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false;
        socket.to(recieverId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });
      }, 3000);

      // Notify reciever
      socket.to(recieverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ convsersationId, recieverId }) => {
      if (!userId || !convsersationId || !recieverId) return;

      if (!typingUsers.has(userId)) {
        const userTyping = typingUsers.get(userId);
        userTyping[conversationId] = false;

        if (userTyping[`${conversationId}_timeout`]) {
          clearTimeout(userTyping[`${conversationId}_timeout`]);
          delete userTyping[`${conversationId}_timeout`];
        }
      }

      socket.to(recieverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false,
      });
    });

    socket.on(
      "add_reaction",
      async ({ messageId, emoji, userId, reactionUserId }) => {
        try {
          const message = Message.findById(messageId);
          if (!message) return;

          const existingIndex = message.reactions.findIndex(
            (r) => r.user.toString() === reactionUserId,
          );

          if (existingIndex > -1) {
            const existing = messsage.reactions(existingIndex);
            if (existing.emoji === emoji) {
              message.reactions.splice(existingIndex, 1);
            } else {
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ user: reactionUserId, emoji });
          }

          await message.save();
          const populatedMessage = await Message.findOne(message?._id)
            .populate("sender", "username profilePicture")
            .populate("reciever", "username profilePicture")
            .populate("reaction.user", "username");

          const reactionUpdated = {
            messageId,
            reactions: populatedMessage.reactions,
          };

          const senderSocket = onlineUsers.get(
            populatedMessage.sender?._id.toString(),
          );
          const recieverrSocket = onlineUsers.get(
            populatedMessage.reciever?._id.toString(),
          );

          if (senderSocket) {
            io.to(senderSocket).emit("reaction_update", reactionUpdated);
          }

          if (recieverSocket) {
            io.to(recieverSocket).emit("reaction_update", reactionUpdated);
          }
        } catch (error) {
          console.error(`Error Handling Reactions`, error.message);
        }
      },
    );

    const handleDisconnected = async () => {
      if (!userId) return;

      try {
        onlineUsers.delete(userId);

        // clear all typing timeouts
        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
          });

          typingUsers.delete(userId);
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user_status", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(userId);
        console.log(`user with ${userId} disconnected`);
      } catch (error) {
        console.error("Error in disconnecting", error.message);
      }
    };

    socket.on("disconnect", handleDisconnected);
  });

  io.socketUserMap = onlineUsers;

  return io;
};
