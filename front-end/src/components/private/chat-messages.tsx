import api from "@/services/api";
import type { MessageType } from "@/types/api-types";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut } from "motion"; // Add this import at the top with other imports
import { PlusIcon } from "lucide-react";
import socket from "@/services/socket";
import { useParams } from "react-router";
// import { toast } from "sonner";

type ResponseType = {
  messages: MessageType[];
  page: number;
  limit: number;
  total: number;
  chat: {
    _id: string;
    members: string[];
  };
};

const transitionDebug = {
  duration: 0.2,
  ease: easeOut,
};

const ChatMessages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [chat, setChat] = React.useState<{
    _id: string;
    members: string[];
  } | null>(null);
  const [msg, setMsg] = React.useState<string>("");
  const token = localStorage.getItem("token");
  useEffect(() => {
    function fetchChatMessages() {
      api.get<ResponseType>(`/msg/messages/${chatId}`).then((response) => {
        // Handle the response and update state
        setMessages(response.data.messages);
        setChat(response.data.chat);
      });
    }

    function onChatMessage(newMsg: MessageType) {
      if (newMsg.chat !== chatId) {
        // toast.message(`new message`, {
        //   description: newMsg.msg,
        //   duration: 4000,
        //   action: {
        //     label: "View",
        //     onClick: () => {
        //       // navigate to chat
        //       location.assign(`/${newMsg.chat}`);
        //     },
        //   },
        // });
        return;
      }
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    }
    fetchChatMessages();
    socket.on("msg", onChatMessage);
    return () => {
      setMessages([]);
      setTimeout(() => {}, 1000); // to avoid react state update on unmounted component error
      socket.off("msg", onChatMessage);
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
      .post(`/msg`, { msg: msg, chatId: chatId, sender: token })
      .then((response) => {
        // Handle the response if needed
        setMessages((prevMessages) => [...prevMessages, response.data]);
        setMsg(""); // Clear the input field after sending the message
        if (!chat) return;
        socket.emit(
          "msg",
          chat.members.filter((id) => id !== token),
          response.data
        );
      });
  };

  return (
    <div className="flex h-screen flex-col items-end justify-end pb-4 px-1">
      <AnimatePresence key={chatId}>
        {messages.map((message, idx) => (
          <motion.div
            key={message._id}
            layout
            className={`z-10 mt-2 max-w-[250px] break-words rounded-2xl ${
              message.sender === token
                ? "self-end bg-green-200 dark:bg-green-900"
                : "self-start bg-gray-200 dark:bg-black"
            }`}
            layoutId={`container-[${message._id}]`}
            initial={{ opacity: 0, y: 20, transition: { delay: idx * 0.03 } }}
            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
            exit={{ opacity: 0, y: -20, transition: { delay: idx * 0.03 } }}
            transition={transitionDebug}
          >
            <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
              {message.msg}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="mt-4 flex w-full">
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
            <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-50" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatMessages;
