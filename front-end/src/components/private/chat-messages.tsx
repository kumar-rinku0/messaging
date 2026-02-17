import api from "@/services/api";
import type { ChatType, MessageType, UserType } from "@/types/api-types";
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { easeOut } from "motion"; // Add this import at the top with other imports
import { MoreVertical, SendHorizonal } from "lucide-react";
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

type ResponseType = {
  messages: MessageType[];
  totalMessages: number;
  page: number;
  totalPages: number;
  limit: number;
  chat: ChatType;
};

const transitionDebug = {
  duration: 0.2,
  ease: easeOut,
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
  const [msg, setMsg] = React.useState<string>("");
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Send the message to the API
    if (!auth_user || msg.trim() === "") {
      console.error("No token found in localStorage or empty message");
      return;
    }
    api
      .post(`/msg/create`, { msg: msg, chatId: chatId, sender: auth_user._id })
      .then((response) => {
        // Handle the response if needed
        const { message } = response.data;
        setMessages((prevMessages) => [...prevMessages, message]);
        setMsg(""); // Clear the input field after sending the message
        if (!chat) return;
        socket.emit("msg", chat._id, message);
      });
  };

  const updateMessages = (ids: string[]) => {
    setMessages((prev) => prev.filter((m) => !ids.includes(m._id)));
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    socket.emit("typing", chatId, auth_user._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", chatId, auth_user._id);
    }, 1000);
  };

  return (
    <div className="h-[100vh]">
      <div className="h-14 px-2 flex justify-between items-center border-b border-b-gray-200">
        <div className="flex flex-col px-4">
          {/* <div className="relative w-12 h-12">
            <img
              src={
                chat?.displayAvatar ||
                "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
              }
              alt=""
              className="object-cover w-12 h-12 rounded-full"
            />
          </div> */}
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
      {/* <div className="flex h-[calc(100vh-40px)] flex-col items-end justify-end pb-4 px-1"> */}
      <div className="flex relative h-[calc(100vh-3.5rem)] flex-col">
        <AllMessages
          key={chatId}
          chatId={chatId}
          messages={messages}
          count={count}
          fetchChatMessages={fetchChatMessages}
          updateMessages={updateMessages}
        />

        {/* <div className="flex w-full"> */}
        <form
          onSubmit={handleSubmit}
          className="h-12 flex justify-center items-center w-full bg-accent dark:bg-accent-foreground px-1 border-t border-t-neutral-200 dark:border-t-neutral-800"
        >
          <input
            type="text"
            onChange={handleTyping}
            value={msg}
            className="relative h-9 w-[250px] flex-grow rounded-lg border border-gray-200 bg-white px-3 text-[15px] outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1
            dark:border-black/60 dark:bg-black dark:text-gray-50 dark:placeholder-gray-500 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700"
            placeholder="Type your message"
          />
          <motion.div
            key={messages.length}
            layout="position"
            className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 [word-break:break-word] dark:bg-black"
            layoutId={`container-[${messages.length}]`}
            initial={{ opacity: 0.6, zIndex: -1 }}
            animate={{ opacity: 0.6, zIndex: -1 }}
            exit={{ opacity: 1, zIndex: 1 }}
            transition={transitionDebug}
          >
            <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-50">
              {msg || "Type your message"}
            </div>
          </motion.div>
          <button
            type="submit"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200
            dark:bg-black"
          >
            <SendHorizonal className="h-5 w-5 text-gray-600 dark:text-gray-50" />
          </button>
        </form>
        {/* </div> */}
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
