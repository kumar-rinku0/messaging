import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const getFormatedChat = (chat, userId) => {
  let displayName;
  let displayAvatar;
  if (chat.type === "group") {
    displayName = chat.name;
    displayAvatar = chat.avatar;
  } else {
    const otherUser = chat.members.find(
      (m) => m._id.toString() !== userId.toString(),
    );
    displayName = otherUser?.username;
    displayAvatar = otherUser?.avatar;
  }
  const notification = chat.notification.find(
    (n) => n.userId.toString() === userId,
  );
  return {
    _id: chat._id,
    type: chat.type,
    updatedAt: chat.updatedAt,
    displayName,
    displayAvatar,
    members: chat.members,
    lastMessage: chat.lastMessage,
    notificationCount: notification.count,
  };
};

export const getOnlineUsers = async (onlineUsers) => {
  const users = await User.find({
    _id: { $in: onlineUsers.map((user) => user.userId) },
  }).select("_id username");
  return users;
};

export const getOneOnlineUserUsername = async (userId) => {
  const user = await User.findById(userId).select("_id username").lean();
  return user ? user.username : null;
};

export const getMembersFromChat = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) return [];
  return chat.members.filter((m) => m.toString() !== userId.toString());
};

export const getChat = async (chatId) => {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) return null;
  return chat;
};

export const updateNotificationCount = async ({ pos, chatId, userId }) => {
  if (pos === "inc") {
    await Chat.updateOne(
      { _id: chatId },
      {
        $inc: {
          "notification.$[n].count": 1,
        },
      },
      {
        arrayFilters: [{ "n.userId": { $ne: userId } }],
        timestamps: false,
      },
    );
  } else if (pos === "reset") {
    await Chat.updateOne(
      {
        _id: chatId,
        "notification.userId": userId,
      },
      {
        $set: { "notification.$.count": 0 },
      },
      {
        timestamps: false,
      },
    );
  }
};
