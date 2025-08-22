import { Request, Response } from "express";
import User from "../models/user.model";
import { verifyPassword } from "@/utils/hashing";
import crypto from "crypto";

const handleUserRegistration = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const newUser = new User({
    username,
    password,
    email,
  });

  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
};

const handleUserLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isRightPassword = verifyPassword(password, user.password);
  if (!isRightPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }
  const token = crypto.randomBytes(32).toString("hex"); // Generate a token (use a proper library in production)
  return res.status(200).json({ message: "Login successful", user, token });
};

const handleGetAllUsers = async (req: Request, res: Response) => {
  const users = await User.find({});
  return res.status(200).json({ users: users });
};

const getOnlineUsers = async (
  onlineUsers: { socketId: string; userId: string }[]
) => {
  const users = await User.find({
    _id: { $in: onlineUsers.map((user) => user.userId) },
  }).select("-password -email -__v");
  return users;
};

export {
  handleUserRegistration,
  handleUserLogin,
  handleGetAllUsers,
  getOnlineUsers,
};
