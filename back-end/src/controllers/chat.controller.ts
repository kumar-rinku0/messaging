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

  res.status(201).json({ chat, ok: true });
};

const handleGetChatById = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId).populate("members");
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }

  res.status(200).json({ chat, ok: true });
};

const handleGetPrivateChat = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { sort } = req.query;

  const query = {
    members: { $all: [userId] },
    name: "private-chat",
    type: "private",
  };
  const chat = await Chat.find(query, { messages: { $slice: -1 } })
    .populate("members", "username _id")
    .sort({ updatedAt: sort === "1" ? 1 : -1 });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }

  res.status(200).json({ chat, ok: true });
};

const handleGetGroupChat = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { sort } = req.query;
  const query = {
    members: { $all: [userId] },
    type: "group",
  };
  const chat = await Chat.find(query, { messages: { $slice: -1 } })
    .populate("members", "username _id")
    .sort({ updatedAt: sort === "1" ? 1 : -1 });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }
  res.status(200).json({ chat, ok: true });
};

const handleGetAllTypeChat = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // const { sort } = req.query;
  // const query = {
  //   members: { $all: [userId] },
  // };
  const chat = await Chat.aggregate([
    { $match: { members: userId } },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "lastMessageDetails",
      },
    },
    {
      $project: {
        type: 1,
        updatedAt: 1,
        lastMessage: { $arrayElemAt: ["${lastMessageDetails}", 0] },
        displayName: {
          $cond: {
            if: { $eq: ["$type", "group"] },
            then: "$groupName",
            else: {
              $let: {
                vars: {
                  otherUser: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$memberDetails",
                          as: "m",
                          cond: { $ne: ["$$m._id", userId] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$otherUser.username",
              },
            },
          },
        },
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found", ok: false });
  }
  res.status(200).json({ chat, ok: true });
};

export {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChat,
  handleGetGroupChat,
  handleGetAllTypeChat,
};
