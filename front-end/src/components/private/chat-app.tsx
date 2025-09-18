import { useEffect } from "react";
import socket from "@/services/socket";

const ChatApp = () => {
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }

    function onMessage(newMsg: { msg: string }) {
      console.log("Received chat message:", newMsg);
      if (Notification.permission === "granted") {
        new Notification("Chat Message", {
          body: `Received chat message: ${newMsg.msg}`,
        });
      }
    }

    socket.on("msg", onMessage);
    return () => {
      socket.off("msg", onMessage);
    };
  }, []);
  return (
    <>
      {/* mobile device view
      <div className="flex md:hidden">
        <SideNav mobile />
      </div> */}
      <div className="flex">
        <div>Chat Messages</div>
      </div>
    </>
  );
};

export default ChatApp;
