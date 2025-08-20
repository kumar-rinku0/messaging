import { useState, useEffect } from "react";
import { socket } from "@/services/socket";
import { ConnectionState } from "../connection-state";

const ChatApp = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

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

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", onChatMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat-message", onChatMessage);
    };
  }, []);
  return (
    <div>
      <ConnectionState isConnected={isConnected} />
      <h1>Chat Application</h1>
      <div>
        {chatMessages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatApp;
