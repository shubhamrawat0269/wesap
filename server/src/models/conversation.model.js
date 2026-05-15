import mongoose from "mongoose";
import conversationSchema from "../schema/conversation.schema.js";

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
