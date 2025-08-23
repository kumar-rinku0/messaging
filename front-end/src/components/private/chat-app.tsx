import { useEffect } from "react";
import { socket } from "@/services/socket";
import { Button } from "../ui/button";
import OnlineUsers from "./online-users";

const ChatApp = () => {
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

    onUsernameSelection();
  }, []);
  return (
    <div>
      <h1>Chat Application</h1>
      <OnlineUsers />
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default ChatApp;

// function onChatMessage(value: any) {
//   console.log("Received chat message:", value);
//   // chrome notification on chat message
//   if (Notification.permission !== "granted") {
//     Notification.requestPermission();
//   }
//   if (Notification.permission === "granted") {
//     new Notification("Chat Message", {
//       body: `Received chat message: ${value}`,
//     });
//   }
// }
