import React, { useEffect } from "react";
import api from "@/services/api";
import type { UserType } from "@/types/api-types";
import socket from "@/services/socket";

type UsersType = UserType[];

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<UsersType>([]);
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  console.log(auth_user);

  useEffect(() => {
    const getOnlineUsers = (users: UsersType) => {
      console.log("Online users from socket:", users);
      const filtered = users.filter((user) => user._id !== user._id);
      setOnlineUsers(filtered);
    };

    socket.on("online-users", getOnlineUsers);

    return () => {
      socket.off("online-users", getOnlineUsers);
    };
  }, [auth_user]);

  // useEffect(() => {
  //   // api.get<ResponseType>("/users/all").then((response) => {
  //   //   const users = response.data.users.filter((user) => user._id !== token);
  //   //   setOnlineUsers(users);
  //   // });

  //   function getChats() {
  //     api.get<ChatType[]>(`/chat/private/${token}`).then((response) => {
  //       setChats(response.data);
  //     });
  //   }
  //   getChats();
  // }, []);

  const handleUserClick = (user: UserType) => {
    api
      .post("/chat/private", {
        sender: user._id,
        recipient: user._id,
      })
      .then((response) => {
        console.log("Private chat created:", response.data);
      })
      .catch((error) => {
        console.error("Error creating private chat:", error);
      });
  };

  // const handleChatSelect = (chat: ChatType) => {
  //   setSelectedChat(chat);
  // };

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
      {/* <div>
        {chats.map((chat) => (
          <SingleChat
            chat={chat}
            key={chat._id}
            online={chat.members.some((member) =>
              onlineUsers.find((user) => user._id === member._id)
            )}
            onClick={() => handleChatSelect(chat)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default OnlineUsers;
