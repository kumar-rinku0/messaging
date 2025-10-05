import React, { Fragment, useEffect } from "react";
import { Link, useLocation } from "react-router";
import type { ChatType, MessageType, UserType } from "@/types/api-types";
import api from "@/services/api";
import socket from "@/services/socket";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
// import {
//   requestNotificationPermission,
//   showNotification,
// } from "@/utils/notifications";

export default function SideNav() {
  const [chats, setChats] = React.useState<ChatType[]>([]);
  const token = localStorage.getItem("token");

  const pathname = useLocation().pathname;
  function isNavItemActive(pathname: string, path: string) {
    return pathname === path;
  }

  const [onlineUsers, setOnlineUsers] = React.useState<UserType[]>([]);

  // async function onMessage(newMsg: { msg: string }) {
  //   console.log("Received chat message:", newMsg);
  //   const permissionGranted = await requestNotificationPermission();
  //   if (permissionGranted) {
  //     showNotification("New Message", { body: newMsg.msg });
  //   }
  // }
  useEffect(() => {
    const getOnlineUsers = (users: UserType[]) => {
      console.log("Online users from socket:", users);
      const filtered = users.filter((user) => user._id !== token);
      setOnlineUsers(filtered);
    };
    const getChats = () => {
      api.get<ChatType[]>(`/chat/private/${token}`).then((response) => {
        setChats(response.data);
      });
    };
    function onChatMessage(newMsg: MessageType) {
      console.log("msg ", newMsg.chat, "path ", pathname);
      if (newMsg.chat !== pathname.slice(1)) {
        toast.message(`new message`, {
          description: newMsg.msg,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              // navigate to chat
              location.assign(`/${newMsg.chat}`);
            },
          },
        });
        return;
      }
    }

    getChats();
    socket.on("online-users", getOnlineUsers);
    socket.on("msg", onChatMessage);

    return () => {
      socket.off("online-users", getOnlineUsers);
      socket.off("msg", onChatMessage);
    };
  }, []);

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("token");
    location.assign("/");
  };

  if (!token) {
    return null;
  }
  const isMobile = useIsMobile();

  return (
    <div className="w-12 md:w-60 h-screen">
      <div className="border-r border-r-neutral-200 dark:border-r-neutral-800 transition-all duration-300 ease-in-out transform flex h-full bg-neutral-50 dark:bg-primary/50">
        <aside className="flex h-full flex-col w-full break-words px-1 md:px-4 overflow-x-hidden columns-1">
          {/* Top */}
          <div className="mt-4 relative pb-2">
            <div className={`flex flex-col transition-all duration-200`}>
              {chats.map((chat) => {
                const member = chat.members.find(
                  (member) => member._id !== token
                );
                const username = member ? member.username : "Unknown";
                if (isMobile) {
                  return (
                    <Fragment key={chat._id}>
                      <div className="flex flex-col my-1">
                        <MobileSideNavItem
                          label={username}
                          path={`/${chat._id}`}
                          active={isNavItemActive(pathname, `/${chat._id}`)}
                          isOnline={onlineUsers.some(
                            (user) => user._id === member?._id
                          )}
                        />
                      </div>
                    </Fragment>
                  );
                }
                return (
                  <Fragment key={chat._id}>
                    <div className="flex flex-col my-1">
                      <SideNavItem
                        label={username}
                        path={`/${chat._id}`}
                        active={isNavItemActive(pathname, `/${chat._id}`)}
                        isOnline={onlineUsers.some(
                          (user) => user._id === member?._id
                        )}
                      />
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
          {/* Bottom */}
          <div className="sticky bottom-0 mt-auto whitespace-nowrap mb-2 transition duration-200 block">
            <Button
              variant={"outline"}
              onClick={handleLogout}
              className={`h-full w-full relative flex items-center whitespace-nowrap rounded-mdhover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white`}
            >
              <div className="relative font-base text-sm px-1 flex flex-row items-center space-x-2 rounded-md duration-100">
                <span className="font-medium">
                  {isMobile ? <LogOut /> : "Logout"}
                </span>
              </div>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const SideNavItem: React.FC<{
  label: string;
  path: string;
  active: boolean;
  isOnline?: boolean;
}> = ({ label, path, active, isOnline }) => {
  return (
    <Link
      to={path}
      className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
        active
          ? "font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white"
          : "hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      }`}
    >
      <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
        <span className="font-medium">{label}</span>
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-white dark:border-black ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        ></span>
      )}
    </Link>
  );
};

const MobileSideNavItem: React.FC<{
  label: string;
  path: string;
  active: boolean;
  isOnline?: boolean;
}> = ({ label, path, active, isOnline }) => {
  return (
    <Link
      to={path}
      className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
        active
          ? "font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white"
          : "hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      }`}
    >
      <div className="relative font-base text-sm p-2 flex flex-row items-center rounded-md duration-100">
        <span className="font-medium truncate">{label.charAt(0)}</span>
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-white dark:border-black ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        ></span>
      )}
    </Link>
  );
};
