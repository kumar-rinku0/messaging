import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (v: Array<Schema.Types.ObjectId>) =>
          Array.isArray(v) && v.length > 1,
        message: "Members must be a non-empty array with at least two members",
      },
    },
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema);

export default Chat;
