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
  return {
    _id: chat._id,
    type: chat.type,
    updatedAt: chat.updatedAt,
    displayName,
    displayAvatar,
    lastMessage: chat.lastMessage,
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
