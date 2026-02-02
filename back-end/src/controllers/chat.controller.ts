import { Request, Response } from "express";
import Chat from "@/models/chat.model";
import { getFormatedChat } from "@/utils/type-fix";

const handleCreatePrivateChat = async (req: Request, res: Response) => {
  const { sender, recipient } = req.body;

  const oldChat = await Chat.findOne({
    members: { $all: [sender, recipient] },
    name: "private-chat",
  }).populate("members", "username avatar");

  if (!oldChat) {
    const chat = new Chat({
      name: "private-chat",
      type: "private",
      admin: sender,
      members: [sender, recipient],
    });
    await chat.save();
    await chat.populate("members", "username avatar");
    return res
      .status(201)
      .json({ chat: getFormatedChat(chat, sender), ok: true });
  }

  return res
    .status(200)
    .json({ chat: getFormatedChat(oldChat, sender), ok: true });
};

const handleCreateGroupChat = async (req: Request, res: Response) => {
  const { name, members } = req.body;

  const chat = new Chat({
    name,
    type: "group",
    admin: members[0],
    members,
  });
  await chat.save();

  return res
    .status(201)
    .json({ chat: getFormatedChat(chat, members[0]), ok: true });
};

const handleGetChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId)
    .select("-notification -lastMessage")
    .populate("members", "username email avatar")
    .lean();
  if (!chat) {
    return res.status(404).json({ message: "chat not found", ok: false });
  }
  const userId = req.user._id as string;
  const members = chat.members as any[];
  const updatedChat = {
    ...chat,
    displayName:
      chat.type === "group"
        ? chat.name
        : members.find((m: any) => m._id.toString() !== userId)?.username,
    displayAvatar:
      chat.type === "group"
        ? chat.avatar
        : members.find((m: any) => m._id.toString() !== userId)?.avatar,
  };

  return res.status(200).json({
    chat: updatedChat,
    ok: true,
    message: "chat is formated to display name & avatar.",
  });
};

const handleGetPrivateChats = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { sort } = req.query;

  const query = {
    members: { $all: [userId] },
    name: "private-chat",
    type: "private",
  };
  const chats = await Chat.find(query, { messages: { $slice: -1 } })
    .populate("members", "username _id")
    .sort({ updatedAt: sort === "1" ? 1 : -1 });
  if (!chats) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }

  res.status(200).json({ chats, ok: true });
};

const handleGetGroupChats = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { sort } = req.query;
  const query = {
    members: { $all: [userId] },
    type: "group",
  };
  const chats = await Chat.find(query, { messages: { $slice: -1 } })
    .populate("members", "username _id")
    .sort({ updatedAt: sort === "1" ? 1 : -1 });
  if (!chats) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }
  return res.status(200).json({ chats, ok: true });
};

const handleGetAllTypeChats = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // const { sort } = req.query;
  // const query = {
  //   members: { $all: [userId] },
  // };
  const chats = await Chat.find({ members: userId })
    .populate({
      path: "members",
      select: "username avatar", // adjust fields as needed
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    })
    .sort({ updatedAt: -1 })
    .lean();

  if (!chats) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }

  const formattedChats = chats.map((chat) => {
    return getFormatedChat(chat, userId);
  });
  return res.status(200).json({ chats: formattedChats, ok: true });
};

const handleUpdateChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { name, avatar } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { name, avatar },
    { new: true },
  );
  if (!updatedChat) {
    return res.status(404).json({ message: "chat not found", ok: false });
  }
  return res
    .status(200)
    .json({ chat: updatedChat, ok: true, message: "chat updated." });
};

const handleDeleteChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findByIdAndDelete(chatId);
  if (!chat) {
    return res.status(400).json({ ok: false, message: "chat id invalid." });
  }
  return res.status(200).json({ ok: true, message: "chat deleted." });
};

export {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChats,
  handleGetGroupChats,
  handleGetAllTypeChats,
  handleUpdateChatById,
  handleDeleteChatById,
};
