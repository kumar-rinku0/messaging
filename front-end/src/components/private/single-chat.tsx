import React from "react";
import api from "@/services/api";
import type { ChatType, MessageType, UserType } from "@/types/api-types";

const SingleChat = ({
  chat,
  online,
  onClick,
}: {
  chat: ChatType;
  online: boolean;
  onClick: (chat: ChatType) => void;
}) => {
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  return (
    <div
      key={chat._id}
      className={`p-2 ${online ? "bg-green-100" : "bg-blue-100"}`}
      onClick={() => onClick(chat)}
    >
      {chat.members.find((member) => member._id !== auth_user._id)?.username}
      <div>
        <LastMessage chatId={chat._id} />
      </div>
    </div>
  );
};

const LastMessage = ({ chatId }: { chatId: string }) => {
  const [lastMessage, setLastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .get<MessageType | null>(`/msg/last-message/chatId/${chatId}`)
      .then((response) => {
        setLastMessage(response.data?.msg || null);
      });
  }, [chatId]);

  return <div>{lastMessage ? lastMessage : "No messages yet"}</div>;
};

export default SingleChat;
