import api from "@/services/api";
import type { ChatType, MessageType, UserType } from "@/types/api-types";
import React, { useEffect } from "react";
import { MoreVertical } from "lucide-react";
import socket from "@/services/socket";
import { useNavigate, useParams } from "react-router";
import { Button } from "../ui/button";
import { useData } from "@/hooks/use-data";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import AllMessages from "./all-messages";
import SendMessage from "./send-message";

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
  const typingUsers = chat.members;
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
      <div className="h-14 px-2 flex justify-between items-center border-b border-b-gray-200">
        <div className="flex justify-center items-center gap-4 px-4">
          <div className="relative w-12 h-12">
            <img
              src={
                chat?.displayAvatar ||
                "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
              }
              alt=""
              className="object-cover w-12 h-12 rounded-full"
            />
          </div>
          <span className="font-semibold">{chat?.displayName}</span>
          {typingUsers && typingUsers.some((user) => user?.typing) && (
            <span className="font-light text-sm truncate">
              {typingUsers
                .filter((user) => user?.typing)
                .map((user) => `${user.username} `)}
              typing
            </span>
          )}
        </div>
        <MoreOptions chatId={chatId!} updateMessages={updateMessages} />
      </div>
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

type ResponseTypeDeleteChat = {
  message: string;
  ok: boolean;
};

type ResponseTypeDeleteMsg = {
  message: string;
  ok: boolean;
};

const MoreOptions = ({
  chatId,
  updateMessages,
}: {
  chatId: string;
  updateMessages: (ids: string[]) => void;
}) => {
  const router = useNavigate();
  const { removeOneChat } = useData();
  const handleDeleteChat = () => {
    api.delete<ResponseTypeDeleteChat>(`/chat/chatId/${chatId}`).then((res) => {
      if (!res.data.ok) {
        toast.error(res.data.message);
        return;
      }
      removeOneChat(chatId);
      router("/");
      toast.success(res.data.message);
    });
  };
  const handleClearMessages = () => {
    api
      .delete<ResponseTypeDeleteMsg>(`/msg/all/chatId/${chatId}`)
      .then((res) => {
        if (!res.data.ok) {
          toast.error(res.data.message);
          return;
        }
        updateMessages([]);
        toast.success(res.data.message);
      });
  };
  return (
    <Popover>
      <PopoverTrigger>
        <MoreVertical />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <PopoverHeader>
          <Button
            variant="link"
            className="justify-start cursor-pointer"
            onClick={handleClearMessages}
          >
            Clear Messages
          </Button>
          <Button
            variant="link"
            onClick={handleDeleteChat}
            className="justify-start cursor-pointer"
          >
            Delete Chat
          </Button>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
};

export default ChatMessages;
