import { Schema, model } from "mongoose";
import { saltAndHashPassword } from "../utils/hashing.js";

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = model("User", userSchema);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = saltAndHashPassword(this.password);
  next();
});

export default User;
