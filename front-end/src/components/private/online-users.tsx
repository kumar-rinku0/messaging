import React, { useEffect } from "react";
import { socket } from "@/services/socket";

type UsersType = {
  socketID: string;
  userID: string;
}[];

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<UsersType>([]);
  const token = localStorage.getItem("token");
  console.log(token);
  useEffect(() => {
    function GetOnlineUsers(users: UsersType) {
      setOnlineUsers([...users]);
      console.log("Online users updated:", users);
    }
    socket.on("users", GetOnlineUsers);
    return () => {
      socket.off("users", GetOnlineUsers);
    };
  }, [onlineUsers]);
  return (
    <div>
      <h1>Online Users</h1>
      <p>List of online users will be displayed here.</p>
      {/* Placeholder for online users list */}
      <div id="online-users-list">
        {/* Online users will be dynamically rendered here */}
        {onlineUsers.map((user) => (
          <div key={user.userID}>{user.userID}</div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
