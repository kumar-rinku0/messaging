import { Request, Response } from "express";
import Message from "@/models/msg.model";
import Chat from "@/models/chat.model";

const handleCreateMessage = async (req: Request, res: Response) => {
  const { chatId, sender, msg } = req.body;

  const message = new Message({
    chat: chatId,
    sender,
    msg,
  });
  await message.save();

  return res.status(201).json(message);
};

const handleGetMessagesByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId)
    .select("_id members")
    .populate("members", "username _id");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  const { page = 1, limit = 20 } = req.query;

  // Pagination logic (optional)
  const skip = (Number(page) - 1) * Number(limit);
  const query = { chat: chatId };

  const totalMessages = await Message.countDocuments(query);

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  return res.status(200).json({
    messages: messages.reverse(),
    totalMessages: totalMessages,
    page,
    totalPages: Math.ceil(totalMessages / Number(limit)),
    limit,
    chat,
  });
};

const handleGetLastMessageByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const lastMessage = await Message.findOne({ chat: chatId }).sort({
    createdAt: -1,
  });
  return res.status(200).json(lastMessage);
};

export {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
};
