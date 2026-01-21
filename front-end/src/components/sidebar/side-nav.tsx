import React, { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, MessageCircleMore } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useData } from "@/hooks/use-data";
// import {
//   requestNotificationPermission,
//   showNotification,
// } from "@/utils/notifications";

const chatTypes = ["private", "group", "all"];

export default function SideNav() {
  const router = useNavigate();
  const isMobile = useIsMobile();
  const { authInfo, logout } = useAuth();
  if (!authInfo) return;
  const { chats, onlineUsers } = useData();
  if (!chats) return null;
  const [currType, setCurrentType] = React.useState(chatTypes[0]);

  const pathname = useLocation().pathname;
  function isNavItemActive(pathname: string, path: string) {
    return pathname === path;
  }

  const handleLogout = async () => {
    await logout();
    router("/");
  };

  return (
    <div className="w-16 md:w-80 h-screen">
      <div className="border-r border-r-neutral-200 dark:border-r-neutral-800 transition-all duration-300 ease-in-out transform flex h-full bg-neutral-50 dark:bg-primary/50">
        <aside className="flex h-full flex-col w-full break-words px-1 md:px-4 overflow-x-hidden columns-1">
          {/* Top */}
          <Link to="/" className="flex items-center space-x-2 p-2">
            <span className="font-semibold">
              {isMobile ? <MessageCircleMore size={40} /> : "Messaging"}
            </span>
          </Link>
          <div>
            <span className="font-semibold">
              {!isMobile && (
                <div className="flex gap-1">
                  {chatTypes.map((chatType) => (
                    <Button
                      key={chatType}
                      variant="outline"
                      className={currType === chatType ? "bg-green-500" : ""}
                      onClick={() => setCurrentType(chatType)}
                    >
                      {chatType}
                    </Button>
                  ))}
                </div>
              )}
            </span>
          </div>
          <div className="mt-4 relative pb-2">
            <div className={`flex flex-col transition-all duration-200`}>
              {chats
                .filter((chat) => {
                  if (currType === "all") {
                    return true;
                  } else {
                    return chat.type === currType;
                  }
                })
                .map((chat) => {
                  const isOnline = onlineUsers.some(
                    (user) => user.username === chat.displayName,
                  );
                  if (isMobile) {
                    return (
                      <Fragment key={chat._id}>
                        <div className="flex flex-col my-1">
                          <MobileSideNavItem
                            label={chat.displayName}
                            avatar={chat.displayAvatar}
                            path={`/${chat._id}`}
                            notificationCount={chat.notificationCount}
                            active={isNavItemActive(pathname, `/${chat._id}`)}
                            isOnline={
                              chat.type === "private" ? isOnline : undefined
                            }
                          />
                        </div>
                      </Fragment>
                    );
                  }
                  return (
                    <Fragment key={chat._id}>
                      <div className="flex flex-col my-1">
                        <SideNavItem
                          label={chat.displayName}
                          avatar={chat.displayAvatar}
                          notificationCount={chat.notificationCount}
                          path={`/${chat._id}`}
                          active={isNavItemActive(pathname, `/${chat._id}`)}
                          isOnline={
                            chat.type === "private" ? isOnline : undefined
                          }
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
  avatar: string;
  notificationCount: number;
  path: string;
  active: boolean;
  isOnline?: boolean;
}> = ({ label, avatar, path, active, notificationCount, isOnline }) => {
  return (
    <Link
      to={path}
      className={`h-full relative flex justify-start items-center whitespace-nowrap rounded-md ${
        active
          ? "font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white"
          : "hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      }`}
    >
      <div className="relative w-12 h-12">
        <img
          src={avatar}
          alt=""
          className="object-cover w-12 h-12 rounded-full"
        />
        {isOnline !== undefined && (
          <span
            className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-black ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
            title={isOnline ? "Online" : "Offline"}
          ></span>
        )}
      </div>
      <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
        <span className="font-medium truncate">{label}</span>
      </div>
      {notificationCount !== 0 && (
        <span
          className={`flex justify-center items-center absolute top-3 right-2 h-6 w-6 rounded-full border-2 border-white dark:border-black bg-red-500 font-bold text-xs truncate text-white`}
          title={`${notificationCount}`}
        >
          {notificationCount}
        </span>
      )}
    </Link>
  );
};

const MobileSideNavItem: React.FC<{
  label: string;
  avatar: string;
  path: string;
  active: boolean;
  isOnline?: boolean;
  notificationCount: number;
}> = ({ avatar, path, active, isOnline, notificationCount }) => {
  return (
    <Link
      to={path}
      className={`h-full relative flex items-center justify-center whitespace-nowrap rounded-md ${
        active
          ? "font-base text-sm bg-neutral-200 shadow-sm text-neutral-700 dark:bg-neutral-800 dark:text-white"
          : "hover:bg-neutral-200 hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      }`}
    >
      {/* <div className="relative font-base text-sm p-2 flex flex-row items-center rounded-md duration-100">
        <span className="font-medium truncate">{label.charAt(0)}</span>
      </div> */}
      <div className="relative w-12 h-12">
        <img
          src={avatar}
          alt=""
          className="object-cover w-12 h-12 rounded-full"
        />
      </div>
      {notificationCount !== 0 && (
        <span
          className={`flex justify-center items-center absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white dark:border-black bg-red-500 font-bold text-xs truncate text-white`}
          title={`${notificationCount}`}
        >
          {notificationCount}
        </span>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-black ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        ></span>
      )}
    </Link>
  );
};
