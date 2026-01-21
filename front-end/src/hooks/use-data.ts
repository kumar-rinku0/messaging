import type { ChatType, MessageType, UserType } from "@/types/api-types";
import { useAuth } from "@/hooks/use-auth";
import socket from "@/services/socket";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";

type AppDataContextType = {
  onlineUsers: UserType[];
  dataState: DataStateType;
  chats: ChatType[] | null;
  addNewChat: (newChat: ChatType) => void;
  resetChatNotifications: (chatId: string) => void;
  updateChatLastMessage: (
    chatId: string,
    message: MessageType,
    count: number,
  ) => void;
};

type DataStateType = {
  loading: boolean;
  error: string;
};

type ChatsDataType = {
  ok: boolean;
  message: string;
  chats: ChatType[];
};

const DataContext = createContext<AppDataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, authInfo } = useAuth();
  if (isLoading || !authInfo) {
    return null;
  }
  const [onlineUsers, setOnlineUsers] = useState<UserType[]>([]);
  const [dataState, setDataState] = useState<DataStateType>({
    loading: false,
    error: "",
  });
  const [chats, setChats] = useState<ChatType[] | null>(null);

  // Load token on app start
  useEffect(() => {
    socket.on("online-users", getOnlineUsers);
    socket.on("notification", onChatMessage);

    getChatsData();
    return () => {
      socket.off("online-users", getOnlineUsers);
      socket.off("notification", onChatMessage);
    };
  }, []);

  const getOnlineUsers = (users: UserType[]) => {
    console.log("Online users from socket:", users);
    const filtered = users.filter(
      (user) => user._id !== authInfo?.auth_user._id,
    );
    setOnlineUsers(filtered);
  };
  function onChatMessage(newMsg: MessageType) {
    console.log("New message received via socket:", newMsg);
    // Optionally, you can update chats or messages here if needed
    updateChatLastMessage(newMsg.chatId, newMsg, 1);
    // router.push({ pathname: "/chat/[slug]", params: { slug: chatId } });
  }

  const changeDataState = <K extends keyof DataStateType>(
    key: K,
    value: DataStateType[K],
  ) => {
    setDataState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getChatsData = async () => {
    changeDataState("loading", true);
    const { data } = await api<ChatsDataType>(
      `/chat/all/userId/${authInfo?.auth_user._id}?sort=-1`,
      {
        method: "GET",
      },
    );
    changeDataState("loading", false);
    if (!data || !data.ok) {
      changeDataState("error", data.message);
    }
    setChats(data.chats);
  };

  const addNewChat = (newChat: ChatType) => {
    if (chats?.some((chat) => chat._id === newChat._id)) return;
    setChats((prev) => [newChat, ...(prev ?? [])]);
  };

  const updateChatLastMessage = (
    chatId: string,
    message: MessageType,
    count: number,
  ) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;
      return prevChats.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: message,
            notificationCount: (chat.notificationCount || 0) + count,
          };
        }
        return chat;
      });
    });
  };

  const resetChatNotifications = (chatId: string) => {
    setChats((prevChats) => {
      if (!prevChats) return prevChats;
      return prevChats.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            notificationCount: 0,
          };
        }
        return chat;
      });
    });
  };

  return React.createElement(
    DataContext.Provider,
    {
      value: {
        onlineUsers,
        chats,
        dataState,
        addNewChat,
        resetChatNotifications,
        updateChatLastMessage,
      },
    },
    children,
  );
};

// Custom hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDate must be used within DataProvider");
  }
  return context;
};
