import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema);

export default Chat;
