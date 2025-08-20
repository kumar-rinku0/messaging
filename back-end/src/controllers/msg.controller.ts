import { Request, Response } from "express";
import Message from "@/models/msg.model";

const handleCreateMessage = async (req: Request, res: Response) => {
  const { chatId, sender, msg } = req.body;

  const message = new Message({
    chat: chatId,
    sender,
    msg,
  });
  await message.save();

  res.status(201).json(message);
};

const handleGetMessagesByChatId = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId }).populate("sender");
  res.status(200).json(messages);
};

export { handleCreateMessage, handleGetMessagesByChatId };
