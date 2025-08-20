import { Request, Response } from "express";
import Chat from "@/models/chat.model";

const handleCreatePrivateChat = async (req: Request, res: Response) => {
  const { sender, recipient } = req.body;

  const chat = new Chat({
    name: "private-chat",
    members: [sender, recipient],
  });
  await chat.save();

  res.status(201).json(chat);
};

const handleCreateGroupChat = async (req: Request, res: Response) => {
  const { name, members } = req.body;

  const chat = new Chat({
    name,
    members,
  });
  await chat.save();

  res.status(201).json(chat);
};

const handleGetChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId).populate("members");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.status(200).json(chat);
};

const handleGetPrivateChat = async (req: Request, res: Response) => {
  const { sender, recipient } = req.params;

  const chat = await Chat.findOne({
    members: { $all: [sender, recipient] },
    name: "private-chat",
  }).populate("members");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.status(200).json(chat);
};

export {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChat,
};
