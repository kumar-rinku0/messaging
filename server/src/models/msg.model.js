import { Schema, model } from "mongoose";

const msgSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    attachment: {
      url: String,
      type: {
        type: String,
        // enum: ["image", "video", "file"],
      },
    },
    seenBy: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
    },
  },
  { timestamps: true },
);

const Message = model("Message", msgSchema);

export default Message;
