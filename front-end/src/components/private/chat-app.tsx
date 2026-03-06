import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import api from "@/services/api";
import { useEffect, useState } from "react";
import type { MessageType, UserType } from "@/types/api-types";
import { toast } from "sonner";
import socket from "@/services/socket";

type ResponseType = {
  users: UserType[];
  message: string;
};

const ChatApp = () => {
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  useEffect(() => {
    function onChatMessage(newMsg: MessageType) {
      toast.message(`new message`, {
        description: newMsg.msg,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            // navigate to chat
            location.assign(`/${newMsg.chatId}`);
          },
        },
      });
    }
    socket.on("msg", onChatMessage);
    return () => {
      socket.off("msg", onChatMessage);
    };
  }, []);

  if (!auth_user) {
    return <div>Please log in to access the chat application.</div>;
  }
  const [searchContent, setSearchContent] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [groupName, setGroupName] = useState("");
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality here
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get("search");
    console.log("Searching for:", searchTerm);
    api
      .get<ResponseType>(`/user/search?q=${searchTerm}&user=${auth_user._id}`)
      .then((response) => {
        console.log("Search results:", response.data);
        setSearchContent(response.data.users);
      });
  };

  const createSingleChat = () => {
    if (selectedUsers.length !== 1) {
      toast.error("Please select exactly 1 user to create a private chat.");
      return;
    }
    api
      .post("/chat/private", {
        sender: auth_user._id,
        recipient: selectedUsers[0]._id,
      })
      .then((response) => {
        console.log("Private chat created or fetched:", response.data);
        location.assign(`/${response.data.chat._id}`); // Redirect to the chat page
      });
  };
  const createGroupChat = () => {
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 users to create a group chat.");
      return;
    }
    const userIds = selectedUsers.map((user) => user._id);
    api
      .post("/chat/group", {
        members: [auth_user._id, ...userIds],
        name: groupName.length > 0 ? groupName : "New Group Chat",
      })
      .then((response) => {
        console.log("Group chat created:", response.data);
        location.assign(`/${response.data.chat._id}`); // Redirect to the chat page
      });
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 1) {
      createSingleChat();
    } else if (selectedUsers.length > 1) {
      createGroupChat();
    }
  };

  const handleUserSelect = (user: UserType) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <>
      {/* mobile device view
      <div className="flex md:hidden">
        <SideNav mobile />
      </div> */}
      <div className="flex flex-wrap justify-start items-start gap-8">
        <div>
          <form
            className="flex items-center justify-center"
            onSubmit={handleSearch}
          >
            <Input
              placeholder="Search... by username"
              name="search"
              className="m-4"
            />
            <Button variant={"outline"} type="submit" className="m-4">
              <Search />
            </Button>
          </form>
          {searchContent.length > 0 ? (
            <div className="m-4">
              <h2 className="mb-2 font-semibold">Search Results:</h2>
              <ul>
                {searchContent.map((user) => (
                  <li
                    key={user._id}
                    className="p-2 border-b"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div>
          {selectedUsers.length > 0 && (
            <div className="m-4">
              <h2 className="mb-2 font-semibold">Selected Users:</h2>
              <ul>
                {selectedUsers.map((user) => (
                  <li key={user._id} className="p-2">
                    {user.username}
                  </li>
                ))}
              </ul>
              {selectedUsers.length >= 2 && (
                <>
                  <p className="text-sm text-gray-500">
                    Group chat will be created since you have selected more than
                    1 user.
                  </p>
                  <Input
                    type="text"
                    placeholder="Group chat name (optional)"
                    className="my-2"
                    onChange={(e) => setGroupName(e.target.value)}
                    value={groupName}
                  />
                </>
              )}
              <Button
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0}
              >
                Create Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatApp;
