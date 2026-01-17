import Chat from "@/models/chat.model";
import User from "@/models/user.model";

export const getFormatedChat = (chat: any, userId: any) => {
  let displayName;
  let displayAvatar;
  if (chat.type === "group") {
    displayName = chat.name;
    displayAvatar = chat.avatar;
  } else {
    const otherUser = chat.members.find(
      (m: any) => m._id.toString() !== userId.toString(),
    ) as any;
    displayName = otherUser?.username;
    displayAvatar = otherUser?.avatar;
  }
  const notification = chat.notification.find((n: any) => n.userId === userId);
  return {
    _id: chat._id,
    type: chat.type,
    updatedAt: chat.updatedAt,
    displayName,
    displayAvatar,
    lastMessage: chat.lastMessage,
    notificationCount: notification ? notification.count : 0,
  };
};

export const getOnlineUsers = async (
  onlineUsers: { socketId: string; userId: string }[],
) => {
  const users = await User.find({
    _id: { $in: onlineUsers.map((user) => user.userId) },
  }).select("_id username");
  return users;
};

export const getMembersFromChat = async (chatId: string, userId: string) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return [];
  return chat.members.filter((m) => m.toString() !== userId.toString());
};

export const getChat = async (chatId: string) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return null;
  return chat;
};

type NotificationUpdateProp = {
  pos: "inc" | "dec" | "reset";
  chatId: string;
  userId: string;
};

export const updateNotificationCount = async ({
  pos,
  chatId,
  userId,
}: NotificationUpdateProp) => {
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
      },
    );
  } else if (pos === "reset") {
    await Chat.updateOne(
      { _id: chatId },
      {
        $set: {
          "notification.$[n].count": 0,
        },
      },
      {
        arrayFilters: [{ "n.userId": { $ne: userId } }],
      },
    );
  }
};
