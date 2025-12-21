import { Request, Response } from "express";
import Chat from "@/models/chat.model";

const handleCreatePrivateChat = async (req: Request, res: Response) => {
  const { sender, recipient } = req.body;

  const oldChat = await Chat.findOne({
    members: { $all: [sender, recipient] },
    name: "private-chat",
  }).populate("members", "username _id");

  if (!oldChat) {
    const chat = new Chat({
      name: "private-chat",
      type: "private",
      admin: sender,
      members: [sender, recipient],
    });
    await chat.save();
    await chat.populate("members", "username _id");
    return res.status(201).json({ chat, ok: true });
  }

  return res.status(200).json({ chat: oldChat, ok: true });
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

  return res.status(201).json({ chat, ok: true });
};

const handleGetChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId).populate("members");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }

  return res.status(200).json({ chat, ok: true });
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
    let displayName;

    if (chat.type === "group") {
      displayName = chat.name;
    } else {
      const otherUser = chat.members.find(
        (m) => m._id.toString() !== userId.toString()
      ) as any;
      displayName = otherUser?.username;
    }

    return {
      _id: chat._id,
      type: chat.type,
      updatedAt: chat.updatedAt,
      displayName,
      lastMessage: chat.lastMessage,
    };
  });
  return res.status(200).json({ chats: formattedChats, ok: true });
};

export {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChats,
  handleGetGroupChats,
  handleGetAllTypeChats,
};
