import { useState, useEffect } from "react";
import { socket } from "@/services/socket";
import { Button } from "../ui/button";

const ChatApp = () => {
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    function onChatMessage(value: any) {
      console.log("Received chat message:", value);
      // chrome notification on chat message
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification("Chat Message", {
          body: `Received chat message: ${value}`,
        });
      }
      setChatMessages((previous) => [...previous, value]);
    }

    socket.on("chat-message", onChatMessage);

    return () => {
      socket.off("chat-message", onChatMessage);
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    location.reload();
  };
  return (
    <div>
      <h1>Chat Application</h1>
      <Button onClick={handleLogout}>logout</Button>
      <div>
        {chatMessages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatApp;
