import { Schema, model } from "mongoose";
import { saltAndHashPassword } from "@/utils/hashing";

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = saltAndHashPassword(this.password);
  next();
});

const User = model("User", userSchema);

export default User;
