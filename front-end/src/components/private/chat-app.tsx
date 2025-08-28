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
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessage(newMsg: { msg: string }) {
      console.log("Received chat message:", newMsg);
      if (Notification.permission === "granted") {
        new Notification("Chat Message", {
          body: `Received chat message: ${newMsg.msg}`,
        });
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("msg", onMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("msg", onMessage);
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
