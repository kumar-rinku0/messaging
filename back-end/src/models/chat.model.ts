import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "private",
      enum: {
        values: ["private", "group"],
        message: "only private and group chats available.",
      },
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: (v: any) => Array.isArray(v) && v.length > 1,
        message: "Members must be a non-empty array with at least two members",
      },
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: [true, "admin is required."],
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema);

export default Chat;
