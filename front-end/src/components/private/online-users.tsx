import React, { useEffect } from "react";
import api from "@/services/api";

type UserType = {
  // socketId: string;
  // userId: string;
  username: string;
  _id: string;
};

type UsersType = UserType[];

type ResponseType = {
  users: UsersType;
};

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<UsersType>([]);
  const [userChat, setUserChat] = React.useState<null | UserType>(null);
  const token = localStorage.getItem("token");
  console.log(token);
  useEffect(() => {
    function GetOnlineUsers() {
      api.get<ResponseType>("/users/all").then((response) => {
        const users = response.data.users.filter((user) => user._id !== token);
        setOnlineUsers(users);
      });
    }
    GetOnlineUsers();
  }, []);

  const handleUserClick = (user: UserType) => {
    setUserChat(user);
    api
      .get(`/chat/private/${token}/${user._id}`)
      .then((response) => {
        // Handle the response for the private chat
        console.log("Private chat data:", response.data.messages);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
          api
            .post("/chat/private", {
              sender: token,
              recipient: user._id,
            })
            .then((response) => {
              console.log("Private chat created:", response.data);
            })
            .catch((error) => {
              console.error("Error creating private chat:", error);
            });
        } else {
          console.error("Error fetching private chat data:", error);
        }
      });
  };

  if (userChat) {
    return (
      <div className="min-h-40 bg-accent">
        <div className="overlay-content">
          <h2>{userChat.username}</h2>
          <p>More information about the user will be displayed here.</p>
          <button onClick={() => setUserChat(null)}>Close</button>
        </div>
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
    </div>
  );
};

export default OnlineUsers;
