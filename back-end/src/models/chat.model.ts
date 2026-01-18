import mongoose, { Schema, model } from "mongoose";

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
    avatar: {
      type: String,
      default:
        "https://ufoodin.com/core/modules/564f78c045/bp-core/images/group-avatar-buddyboss.png",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "admin is required."],
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    notification: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          count: {
            type: Number,
            default: 0,
          },
          _id: false,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

chatSchema.pre("save", function (next) {
  if (this.isModified("members")) {
    // Handle members modification if needed
    this.set(
      "notification",
      this.members.map((m) => ({ userId: m, count: 0 })),
    );
  }
  next();
});

const Chat = model("Chat", chatSchema);

export default Chat;
