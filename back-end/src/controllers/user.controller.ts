import { Request, Response } from "express";
import User from "../models/user.model";
import { verifyPassword } from "@/utils/hashing";

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
  return res.status(200).json({ message: "Login successful", user });
};

export { handleUserRegistration, handleUserLogin };
