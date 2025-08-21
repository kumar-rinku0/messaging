import React, { useEffect } from "react";
import api from "@/services/api";
import type { UserType, ChatType, MessageType } from "@/types/api-types";

type UsersType = UserType[];

type ResponseType = {
  users: UsersType;
};

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<UsersType>([]);
  const [chats, setChats] = React.useState<ChatType[]>([]);
  const token = localStorage.getItem("token");
  console.log(token);
  useEffect(() => {
    function getOnlineUsers() {
      api.get<ResponseType>("/users/all").then((response) => {
        const users = response.data.users.filter((user) => user._id !== token);
        setOnlineUsers(users);
      });
    }
    function getChats() {
      api.get<ChatType[]>(`/chat/private/${token}`).then((response) => {
        setChats(response.data);
      });
    }
    getOnlineUsers();
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
        setOnlineUsers((prevUsers) =>
          prevUsers.filter((u) => u._id !== user._id)
        );
      })
      .catch((error) => {
        console.error("Error creating private chat:", error);
      });
  };

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
          <div key={chat._id} className="p-2 bg-blue-100">
            {chat.members.find((member) => member._id !== token)?.username}
            <div>
              <LastMessage chatId={chat._id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LastMessage = ({ chatId }: { chatId: string }) => {
  const [lastMessage, setLastMessage] = React.useState<string | null>(null);

  useEffect(() => {
    api
      .get<MessageType | null>(`/msg/last-message/${chatId}`)
      .then((response) => {
        setLastMessage(response.data?.msg || null);
      });
  }, [chatId]);

  return <div>{lastMessage ? lastMessage : "No messages yet"}</div>;
};

export default OnlineUsers;
