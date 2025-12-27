import { Schema, model } from "mongoose";
import { saltAndHashPassword } from "@/utils/hashing";

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required."],
    unique: [true, "username must be unique."],
  },
  avatar: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
  },
  email: {
    type: String,
    required: [true, "email is required."],
    unique: [true, "email must be unique."],
  },
  password: { type: String, required: [true, "password is required."] },
  devices: {
    type: [
      {
        deviceName: {
          type: String,
          required: true,
        },
        ip: {
          type: String,
          required: true,
        },
        userAgent: {
          type: String,
          required: true,
        },
        token: String,
        lastUsed: Date,
      },
    ],
    default: [],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = saltAndHashPassword(this.password);
  next();
});

const User = model("User", userSchema);

export default User;
