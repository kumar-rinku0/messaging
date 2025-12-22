import { Request, Response } from "express";
import User from "../models/user.model";
import { verifyPassword } from "@/utils/hashing";
import { setUser } from "@/utils/jwt";

const handleUserRegistration = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const newUser = new User({
    username,
    password,
    email,
  });
  await newUser.save();

  const auth_token = setUser({
    _id: newUser._id.toString(),
    email: newUser.email,
    username: newUser.username,
  });
  res.cookie("auth_token", auth_token, {
    signed: true,
    httpOnly: true, // Optional: Makes the cookie inaccessible to client-side JavaScript
    maxAge: 1000 * 60 * 60 * 24, // Optional: Cookie expiration time (1 day)
  });

  res.status(201).json({
    message: "User registered successfully",
    userId: newUser._id,
    auth_token,
    ok: true,
  });
};

const handleUserLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found", ok: false });
  }
  const isRightPassword = verifyPassword(password, user.password);
  if (!isRightPassword) {
    return res.status(401).json({ message: "Invalid password", ok: false });
  }
  const auth_token = setUser({
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
  });
  res.cookie("auth_token", auth_token, {
    signed: true,
    httpOnly: true, // Optional: Makes the cookie inaccessible to client-side JavaScript
    maxAge: 1000 * 60 * 60 * 24, // Optional: Cookie expiration time (1 day)
  });
  return res.status(200).json({
    message: "Login successful",
    userId: user._id,
    auth_token,
    ok: true,
  });
};

const handleGetAllUsers = async (req: Request, res: Response) => {
  const users = await User.find({}).select("-password -email -__v");
  return res.status(200).json({ users: users, ok: true });
};

const handleGetSearchedUser = async (req: Request, res: Response) => {
  const { q, user } = req.query;
  const users = await User.find({
    username: { $regex: q, $options: "i" },
    _id: { $ne: user },
  }).select("-password -email -__v");
  return res.status(200).json({ users: users, ok: true });
};

const getOnlineUsers = async (
  onlineUsers: { socketId: string; userId: string }[]
) => {
  const users = await User.find({
    _id: { $in: onlineUsers.map((user) => user.userId) },
  }).select("_id username");
  return users;
};

export {
  handleUserRegistration,
  handleUserLogin,
  handleGetAllUsers,
  handleGetSearchedUser,
  getOnlineUsers,
};
