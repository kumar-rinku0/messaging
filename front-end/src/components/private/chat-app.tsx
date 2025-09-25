import { useEffect } from "react";
import socket from "@/services/socket";
import {
  requestNotificationPermission,
  showNotification,
} from "@/utils/notifications";

const ChatApp = () => {
  useEffect(() => {
    async function onMessage(newMsg: { msg: string }) {
      console.log("Received chat message:", newMsg);
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        showNotification("New Message", { body: newMsg.msg });
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
