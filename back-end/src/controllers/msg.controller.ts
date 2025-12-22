import { Request, Response } from "express";
import Message from "@/models/msg.model";
import Chat from "@/models/chat.model";
import { getFormatedChat } from "@/utils/type-fix";

const handleCreateMessage = async (req: Request, res: Response) => {
  const { chatId, sender, msg } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(400).json({ message: "chat not found", ok: false });
  }
  const message = new Message({
    chat: chatId,
    sender,
    msg,
    seenBy: [sender],
  });
  await message.save();
  chat.lastMessage = message._id;
  await chat.save();

  return res.status(201).json({ message, ok: true });
};

const handleGetMessagesByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate("members", "username _id");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }
  const { page = 1, limit = 20, userId } = req.query;

  // Pagination logic (optional)
  const skip = (Number(page) - 1) * Number(limit);
  const query = { chat: chatId };

  const totalMessages = await Message.countDocuments(query);

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  const formatedChat = getFormatedChat(chat, userId);
  return res.status(200).json({
    messages: messages.reverse(),
    totalMessages: totalMessages,
    page: Number(page),
    totalPages: Math.ceil(totalMessages / Number(limit)),
    sort: -1,
    limit,
    chat: userId ? formatedChat : chat,
    ok: true,
  });
};

const handleGetAllMessagesByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate("members", "username _id");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }
  const query = { chat: chatId };
  const sorted = -1;
  const totalMessages = await Message.countDocuments(query);
  const messages = await Message.find(query).sort({ createdAt: sorted });

  return res.status(200).json({
    messages: messages,
    totalMessages: totalMessages,
    sort: sorted,
    chat,
    ok: true,
  });
};

const handleGetLastMessageByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const lastMessage = await Message.findOne({ chat: chatId }).sort({
    createdAt: -1,
  });
  return res.status(200).json({ lastMessage, ok: true });
};

export {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
  handleGetAllMessagesByChatId,
};
