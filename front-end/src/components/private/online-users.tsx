import React, { useEffect } from "react";
import api from "@/services/api";
import type { UserType, ChatType } from "@/types/api-types";
import SingleChat from "./single-chat";
import ChatMessages from "./chat-messages";
import { Button } from "../ui/button";
import socket from "@/services/socket";

type UsersType = UserType[];

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<UsersType>([]);
  const [chats, setChats] = React.useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<ChatType | null>(null);
  const token = localStorage.getItem("token");
  console.log(token);

  useEffect(() => {
    const getOnlineUsers = (users: UsersType) => {
      console.log("Online users from socket:", users);
      const filtered = users.filter((user) => user._id !== token);
      setOnlineUsers(filtered);
    };

    socket.on("online-users", getOnlineUsers);

    return () => {
      socket.off("online-users", getOnlineUsers);
    };
  }, [token]);

  useEffect(() => {
    // api.get<ResponseType>("/users/all").then((response) => {
    //   const users = response.data.users.filter((user) => user._id !== token);
    //   setOnlineUsers(users);
    // });

    function getChats() {
      api.get<ChatType[]>(`/chat/private/${token}`).then((response) => {
        setChats(response.data);
      });
    }
    getChats();
  }, []);

  const handleUserClick = (user: UserType) => {
    api
      .post("/chat/private", {
        sender: token,
        recipient: user._id,
      })
      .then((response) => {
        console.log("Private chat created:", response.data);
        if (chats.some((chat) => chat._id === response.data._id)) {
          setSelectedChat(response.data);
        } else {
          setChats((prevChats) => [
            ...prevChats,
            {
              ...response.data,
              members: [user, { _id: token, username: "You" }],
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Error creating private chat:", error);
      });
  };

  const handleChatSelect = (chat: ChatType) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  if (selectedChat) {
    return (
      <div>
        <Button onClick={handleCloseChat}>Close Chat</Button>
        <ChatMessages chat={selectedChat} />
      </div>
    );
  }

  return (
    <div className="min-h-40 bg-accent">
      <h1>Online Users</h1>
      <p>List of online users will be displayed here.</p>
      {/* Placeholder for online users list */}
      <div id="online-users-list" className="flex flex-wrap gap-2">
        {/* Online users will be dynamically rendered here */}
        {onlineUsers.map((user) => (
          <div
            className="p-2 bg-amber-100"
            key={user._id}
            onClick={() => handleUserClick(user)}
          >
            {user.username}
          </div>
        ))}
      </div>
      <div>
        {chats.map((chat) => (
          <SingleChat
            chat={chat}
            key={chat._id}
            onClick={() => handleChatSelect(chat)}
          />
          // <div key={chat._id} className="p-2 bg-blue-100">
          //   {chat.members.find((member) => member._id !== token)?.username}
          //   <div>
          //     <LastMessage chatId={chat._id} />
          //   </div>
          // </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
