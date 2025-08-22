import React from "react";
import api from "@/services/api";
import type { ChatType, MessageType } from "@/types/api-types";

const SingleChat = ({
  chat,
  onClick,
}: {
  chat: ChatType;
  onClick: (chat: ChatType) => void;
}) => {
  const token = localStorage.getItem("token");
  return (
    <div
      key={chat._id}
      className="p-2 bg-blue-100"
      onClick={() => onClick(chat)}
    >
      {chat.members.find((member) => member._id !== token)?.username}
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
      .get<MessageType | null>(`/msg/last-message/${chatId}`)
      .then((response) => {
        setLastMessage(response.data?.msg || null);
      });
  }, [chatId]);

  return <div>{lastMessage ? lastMessage : "No messages yet"}</div>;
};

export default SingleChat;
