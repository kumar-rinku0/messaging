import { useEffect } from "react";
import socket from "@/services/socket";
import {
  requestNotificationPermission,
  showNotification,
} from "@/utils/notifications";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-gray-500">
          Chat interface is not available on mobile devices. Please use a
          desktop or tablet for the full experience.
        </p>
      </div>
    );
  }

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
