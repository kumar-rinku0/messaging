import api from "@/services/api";
import type { MessageType } from "@/types/api-types";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import socket from "@/services/socket";
import { useParams } from "react-router";

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
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    }
    fetchChatMessages();
    socket.on("msg", onChatMessage);
    return () => {
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
    <div className="min-h[90vh] flex flex-col justify-between h-screen">
      <ul className="flex flex-col space-y-2">
        {messages.map((message) => (
          <li
            key={message._id}
            className={message.sender === token ? "text-right" : "text-left"}
          >
            {message.msg}
            <span className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          </li>
        ))}
      </ul>
      {/* Placeholder for chat messages list */}
      <div className="p-4 bg-gray-100">
        <form onSubmit={handleSubmit} className="flex justify-between gap-2">
          <Input
            type="text"
            name="msg"
            placeholder="Type your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default ChatMessages;
