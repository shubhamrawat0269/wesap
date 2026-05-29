import Message from "../models/message.model.js";
import response from "../config/responseHandler.js";
import Conversation from "../models/conversation.model.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";

const sendMessage = async (req, res) => {
  try {
    const { sender, reciever, content, messageStatus } = req.body;
    const file = req.file;

    const participants = [sender, reciever].sort();
    let conversation = await Conversation.findOne({
      participants,
    });

    if (!conversation) {
      conversation = new Conversation({
        participants,
      });

      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    if (file) {
      const uploadFile = await uploadOnCloudinary(file);

      if (!uploadFile.secure_url) {
        return response(res, 400, "Failed to upload media");
      }

      imageOrVideoUrl = uploadFile.secure_url;

      // TODO : How to set content type
      console.log(file.mimetype, "FILE TYPE");
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message Content is Required");
    }

    const message = new Message({
      conversation: conversation?._id,
      sender,
      reciever,
      content,
      contentType,
      imageOrVideoUrl,
      messageStatus,
    });

    await message.save();

    if (message?.content) conversation.lastMessage = message._id;
    conversation.unreadCount += 1;
    await conversation.save();

    const populateMessage = await Message.findById(message._id)
      .populate("sender", "username profilePicture")
      .populate("reciever", "username profilePicture");

    return response(res, 201, "Message Send Successfully", populateMessage);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.userId;
  try {
    let conversation = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profilePicture isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender reciever",
          select: "username profilePicture",
        },
      })
      .sort({ updatedAt: -1 });

    return response(res, 201, "Conversation fetch Successfully", conversation);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return response(res, 404, "Conversation Not Found");
    }

    if (!conversation.participants.includes(userId)) {
      return response(res, 403, "Not Authorized to view this conversation");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profilePicture")
      .populate("reciever", "username profilePicture")
      .sort("createdAt");

    await Message.updateMany(
      {
        conversation: conversationId,
        reciever: userId,
        messageStatus: { $in: ["send", "delivered"] },
      },
      { $set: { messageStatus: "read" } },
    );

    conversation.updateCount = 0;
    await conversation.save();

    return response(res, 200, "Message Retrieved", messages);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const markAsRead = async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.userId;

  try {
    let messages = await Message.find({
      _id: { $in: messageIds },
      reciever: userId,
    });

    await Message.updateMany(
      { _id: { $in: messageIds }, reciever: userId },
      { $set: { messageStatus: "read" } },
    );

    return response(res, 200, "Messages marked as read", messages);
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.userId;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return response(res, 404, "Message Not Found");
    }

    if (message.sender.toString() !== userId) {
      return response(res, 403, "Not Authorized to delete this message");
    }

    await message.deleteOne();

    return response(res, 200, "Messages deleted successfully");
  } catch (error) {
    console.error(error.message);
    return response(res, 500, "Internal Server Error");
  }
};

export {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
};
