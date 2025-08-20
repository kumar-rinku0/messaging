import { Request, Response } from "express";
import User from "../models/user.model";

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

export { handleUserRegistration };
