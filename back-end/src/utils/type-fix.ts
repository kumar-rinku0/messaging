export const getFormatedChat = (chat: any, userId: any) => {
  let displayName;

  if (chat.type === "group") {
    displayName = chat.name;
  } else {
    const otherUser = chat.members.find(
      (m: any) => m._id.toString() !== userId.toString()
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
};
