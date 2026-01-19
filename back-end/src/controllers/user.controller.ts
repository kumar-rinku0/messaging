import { Request, Response } from "express";
import User, { Session } from "@/models/user.model";
import { verifyPassword } from "@/utils/hashing";
import { setUser } from "@/utils/jwt";

const handleUserRegistration = async (req: Request, res: Response) => {
  const { username, email, password, client } = req.body;
  const newUser = new User({
    username,
    password,
    email,
  });
  await newUser.save();
  let session_id = null;
  if (client) {
    session_id = await createSession(req, newUser._id.toString());
  }
  const user = {
    _id: newUser._id.toString(),
    email: newUser.email,
    avatar: newUser.avatar,
    username: newUser.username,
  };
  const auth_token = setUser(user);
  res.status(201).json({
    message: "User registered successfully",
    userId: newUser._id,
    user: user,
    auth_token,
    session_id,
    ok: true,
  });
};

const handleUserLogin = async (req: Request, res: Response) => {
  const { username, password, client } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found", ok: false });
  }
  const isRightPassword = verifyPassword(password, user.password);
  if (!isRightPassword) {
    return res.status(401).json({ message: "Invalid password", ok: false });
  }
  let session_id = null;
  if (client) {
    session_id = await createSession(req, user._id.toString());
  }
  const authUser = {
    _id: user._id.toString(),
    email: user.email,
    avatar: user.avatar,
    username: user.username,
  };
  const auth_token = setUser(authUser);
  return res.status(200).json({
    message: "Login successful",
    userId: user._id,
    user: authUser,
    auth_token,
    session_id,
    ok: true,
  });
};

const handleUserLogout = async (req: Request, res: Response) => {
  const auth_user = req.user;
  if (!auth_user) {
    return res
      .status(400)
      .json({ message: "user isn't logged in.", ok: false });
  }
  const user = await Session.deleteMany({ userId: auth_user._id });
  if (!user) {
    return res.status(400).json({ message: "user not found.", ok: false });
  }
  return res.status(200).json({ message: "user logged out.", ok: true });
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

const handleUpdateUserDetails = async (req: Request, res: Response) => {
  const { avatar, email, username } = req.body;
  const auth_user = req.user;
  const user = await User.findById(auth_user._id).select(
    "avatar email username",
  );
  if (!user) {
    return res.status(400).json({ ok: false, message: "user not found." });
  }
  user.avatar = !!avatar ? avatar : user.avatar;
  user.email = !!email ? email : user.email;
  user.username = !!username ? username : user.username;
  await user.save();

  return res
    .status(400)
    .json({ ok: true, message: "user updated.", updatedUser: user });
};

export {
  handleUserRegistration,
  handleUserLogin,
  handleGetAllUsers,
  handleGetSearchedUser,
  handleUserLogout,
  handleUpdateUserDetails,
};

const createSession = async (req: Request, userId: string) => {
  const { client } = req.body;
  const ip =
    (req.headers["x-forwarded-for"] as string) ||
    (req.socket.remoteAddress as string) ||
    "";
  const deviceInfo = {
    userId: userId,
    deviceName: client.os || "Unknown",
    ip: ip,
    userAgent: client.agent || req.headers["user-agent"],
    token: client.token,
    lastUsed: Date.now(),
  };
  const session = new Session(deviceInfo);
  await session.save();
  return session._id;
};
