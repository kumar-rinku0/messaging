import api from "@/services/api";
import type { ChatType, MessageType, UserType } from "@/types/api-types";
import React, { useEffect } from "react";
import socket from "@/services/socket";
import { useParams } from "react-router";

import { useData } from "@/hooks/use-data";

import AllMessages from "./all-messages";
import SendMessage from "./send-message";
import ChatHeader from "./chat-header";

type ResponseType = {
  messages: MessageType[];
  totalMessages: number;
  page: number;
  totalPages: number;
  limit: number;
  chat: ChatType;
};

const ChatMessages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { chats } = useData();
  const chat = chats?.find((c) => c._id === chatId);
  if (!chatId || !chat) return <div>Invalid Chat Id</div>;
  return <ChatMsgFunc key={chatId} chatId={chatId} chat={chat} />;
};

const ChatMsgFunc = ({ chatId, chat }: { chatId: string; chat: ChatType }) => {
  const { resetChatNotifications } = useData();
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [count, setCount] = React.useState<{
    totalMessages: number;
    page: number;
    totalPages: number;
    limit: number;
  }>({ totalMessages: 0, page: 1, totalPages: 1, limit: 0 });

  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  function fetchChatMessages(page: number) {
    api
      .get<ResponseType>(
        `/msg/chatId/${chatId}?page=${page}&user=${auth_user._id}`,
      )
      .then((response) => {
        // Handle the response and update state
        const {
          messages: newMessages,
          totalMessages,
          totalPages,
          page,
          limit,
        } = response.data;
        if (page == 1) {
          setMessages(newMessages);
        } else {
          const allMessages = [...newMessages, ...messages];
          setMessages(allMessages);
        }
        setCount({ totalMessages, page, totalPages, limit });
      });
  }
  useEffect(() => {
    if (!chatId) return;

    function onChatMessage(newMsg: MessageType) {
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    }
    fetchChatMessages(1);
    socket.emit("join-chat", chatId);
    socket.on("msg", onChatMessage);
    resetChatNotifications(chatId);
    return () => {
      socket.emit("leave-chat", chatId);
      socket.off("msg", onChatMessage);
      resetChatNotifications(chatId);
    };
  }, [chatId]);

  const updateMessages = (ids: string[]) => {
    setMessages((prev) => prev.filter((m) => !ids.includes(m._id)));
  };

  return (
    <div className="h-[100vh]">
      {/* chat header */}
      <ChatHeader chatId={chatId} chat={chat} />
      {/* messages */}
      <div className="flex relative h-[calc(100vh-3.5rem)] flex-col">
        <AllMessages
          key={chatId}
          chatId={chatId}
          messages={messages}
          count={count}
          fetchChatMessages={fetchChatMessages}
          updateMessages={updateMessages}
        />
        {/* input & send message button */}
        <SendMessage
          chatId={chatId}
          chat={chat}
          setMessages={setMessages}
          messages={messages}
        />
      </div>
    </div>
  );
};

export default ChatMessages;
