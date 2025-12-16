import mongoose, { Document, Schema } from "mongoose";

interface IChat extends Document {
  chatName: string;
  isGroupChat: boolean;
  users: mongoose.Types.ObjectId[];
  latestMessage: mongoose.Types.ObjectId;
  groupAdmin?: mongoose.Types.ObjectId;
}

const chatSchema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References the User model
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // References the Message model
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;