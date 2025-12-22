import api from "@/services/api";
import type { ChatType, MessageType } from "@/types/api-types";
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { easeOut } from "motion"; // Add this import at the top with other imports
import { ArrowLeft, SendHorizonal } from "lucide-react";
import socket from "@/services/socket";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

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
  const router = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [count, setCount] = React.useState<{
    totalMessages: number;
    page: number;
    totalPages: number;
    limit: number;
  }>({ totalMessages: 0, page: 1, totalPages: 1, limit: 0 });
  const [chat, setChat] = React.useState<ChatType | null>(null);
  const [msg, setMsg] = React.useState<string>("");
  const token = localStorage.getItem("token");
  function fetchChatMessages(page: number) {
    api
      .get<ResponseType>(`/msg/chatId/${chatId}?page=${page}&userId=${token}`)
      .then((response) => {
        // Handle the response and update state
        const {
          messages: newMessages,
          totalMessages,
          chat,
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
        setChat(chat);
      });
  }
  useEffect(() => {
    function onChatMessage(newMsg: MessageType) {
      if (newMsg.chat !== chatId) {
        toast.message(`new message`, {
          description: newMsg.msg,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              // navigate to chat
              location.assign(`/${newMsg.chat}`);
            },
          },
        });
        return;
      }
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    }
    fetchChatMessages(1);
    socket.on("msg", onChatMessage);
    return () => {
      setMessages([]);
      socket.off("msg", onChatMessage);
      // setTimeout(() => {}, 1000); // to avoid react state update on unmounted component error
    };
  }, [chatId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Send the message to the API
    if (!token || msg.trim() === "") {
      console.error("No token found in localStorage or empty message");
      return;
    }
    api
      .post(`/msg/create`, { msg: msg, chatId: chatId, sender: token })
      .then((response) => {
        // Handle the response if needed
        const { message } = response.data;
        setMessages((prevMessages) => [...prevMessages, message]);
        setMsg(""); // Clear the input field after sending the message
        if (!chat) return;
        socket.emit("msg", { chatId: chat._id, userId: token }, message);
      });
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef<boolean>(true);

  useEffect(() => {
    if (shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      shouldScrollRef.current = true;
    }
  }, [messages]);

  return (
    <div>
      <div className="h-10 p-2 flex items-center bg-white border-b-2 border-b-amber-100">
        <span>
          <ArrowLeft
            className="mr-4 inline h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-50"
            onClick={() => {
              router("/");
            }}
          />
        </span>
        <span className="font-semibold">{chat?.displayName}</span>
      </div>
      {/* <div className="flex h-[calc(100vh-40px)] flex-col items-end justify-end pb-4 px-1"> */}
      <div className="flex h-[calc(100vh-40px)] flex-col pb-4 px-1">
        <ScrollArea className="flex-1 w-full overflow-y-auto">
          {messages.length > 10 && count.page < count.totalPages ? (
            <Button
              className="w-full text-center"
              variant="link"
              onClick={() => {
                shouldScrollRef.current = false;
                fetchChatMessages(count.page + 1);
              }}
            >
              load more
            </Button>
          ) : (
            <div className="p-1" />
          )}
          <div className="flex flex-col gap-2 px-2">
            {messages.map((message) => (
              <motion.div
                key={message._id}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow
          ${
            message.sender === token
              ? "self-end bg-green-500 text-white"
              : "self-start bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
          }`}
              >
                {message.msg}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* </div> */}

        <div className="flex w-full">
          <form onSubmit={handleSubmit} className="flex w-full">
            <input
              type="text"
              onChange={(e) => setMsg(e.target.value)}
              value={msg}
              className="relative h-9 w-[250px] flex-grow rounded-full border border-gray-200 bg-white px-3 text-[15px] outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1
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
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
