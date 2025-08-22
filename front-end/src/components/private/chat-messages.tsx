import api from "@/services/api";
import type { ChatType, MessageType } from "@/types/api-types";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const ChatMessages = ({ chat }: { chat: ChatType }) => {
  const { _id: chatId } = chat;
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [msg, setMsg] = React.useState<string>("");
  const token = localStorage.getItem("token");
  useEffect(() => {
    function fetchChatMessages() {
      api.get<MessageType[]>(`/msg/messages/${chatId}`).then((response) => {
        // Handle the response and update state
        setMessages(response.data);
      });
    }
    fetchChatMessages();
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
      });
  };

  return (
    <div>
      <h1>Chat Messages</h1>
      <p>Messages for the selected chat will be displayed here.</p>
      <ul className="flex flex-col space-y-2">
        {messages.map((message) => (
          <li
            key={message._id}
            className={
              message.sender === token ? "w-sm text-right" : "w-sm text-left"
            }
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
      <div className="w-sm p-4 flex justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
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
