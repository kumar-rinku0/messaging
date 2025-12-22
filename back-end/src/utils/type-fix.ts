export const getFormatedChat = (chat: any, userId: any) => {
  let displayName;
  let displayAvatar;

  if (chat.type === "group") {
    displayName = chat.name;
    displayAvatar = chat.avatar;
  } else {
    const otherUser = chat.members.find(
      (m: any) => m._id.toString() !== userId.toString()
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
