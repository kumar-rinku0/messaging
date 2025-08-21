import { useState, useEffect } from "react";
import { socket } from "@/services/socket";
import { Button } from "../ui/button";
import OnlineUsers from "./online-users";

const ChatApp = () => {
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    location.reload();
  };

  useEffect(() => {
    const onUsernameSelection = () => {
      socket.auth = { userId: token };
      socket.connect();
    };

    function onConnect() {
      console.log("Connected to socket server");
      socket.emit("newUser", token);
    }

    function onDisconnect() {
      console.log("Disconnected from socket server");
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
    onUsernameSelection();
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
      <h1>Chat Application</h1>
      <OnlineUsers />
      <Button onClick={handleLogout}>Logout</Button>
      <div>
        {chatMessages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatApp;
