import { useEffect, useState } from "react";
import socket from "@/services/socket";
import { Button } from "../ui/button";
import OnlineUsers from "./online-users";

const ChatApp = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const token = localStorage.getItem("token");
  socket.auth = { userId: token };
  socket.connect();

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    location.reload();
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <div>
      <h1>Chat Application</h1>
      <div>currently you're {isConnected ? "connected" : "disconnected"}</div>
      <OnlineUsers />
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default ChatApp;
